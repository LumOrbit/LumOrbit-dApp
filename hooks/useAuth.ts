import { useEffect, useState, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useStellarWallet } from './useStellarWallet';

interface UserData {
  full_name?: string;
  phone?: string;
  country?: string;
  [key: string]: unknown;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { createInvisibleWallet, loadWalletData, clearWalletData } = useStellarWallet();
  
  // Add guards to prevent concurrent operations
  const isCreatingWallet = useRef(false);
  const isLoadingWallet = useRef(false);
  const lastProcessedUserId = useRef<string | null>(null);

  const createWalletForUser = async (userId: string, email: string, userData?: UserData) => {
    // Prevent concurrent wallet creation
    if (isCreatingWallet.current) {
      console.log('Wallet creation already in progress, skipping...');
      return null;
    }
    
    isCreatingWallet.current = true;
    const maxRetries = 2; // Reduced from 3 to 2
    const retryDelay = 2000; // Increased delay to 2 seconds

    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Creating wallet for authenticated user (attempt ${attempt}/${maxRetries}):`, userId);
          console.log('Profile data to be saved:', userData);
          
          // Create invisible wallet
          const walletData = await createInvisibleWallet(userId, email);
          
          if (!walletData) {
            console.error('Failed to create invisible wallet');
            throw new Error('Failed to create wallet');
          }

          console.log('Invisible wallet created successfully:', {
            publicKey: walletData.publicKey,
            hasEncryptedKey: !!walletData.encryptedPrivateKey
          });
          
          console.log('🔄 Starting database save process...');
          
          // Skip connection test to reduce requests
          console.log('💾 Upserting user record with wallet data...');
          
          // Prepare the upsert data
          console.log('📝 Preparing upsert payload...');
          const upsertPayload = {
            id: userId,
            email: email,
            full_name: userData?.full_name || null,
            phone: userData?.phone || null,
            country: userData?.country || null,
            wallet_address: walletData.walletAddress,
            public_key: walletData.publicKey,
            private_key: walletData.encryptedPrivateKey,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('✅ Upsert payload prepared successfully');

          // Reduce timeout to 8 seconds instead of 10
          const upsertPromise = supabase
            .from('users')
            .upsert(upsertPayload)
            .select();

          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Database operation timed out')), 8000);
          });

          console.log('⏱️ Executing upsert with timeout...');
          
          let upsertData, upsertError;
          try {
            const result = await Promise.race([
              upsertPromise,
              timeoutPromise
            ]) as any;
            
            upsertData = result.data;
            upsertError = result.error;
            console.log('✅ Upsert operation completed');
          } catch (raceError) {
            console.error('❌ Upsert operation failed or timed out:', raceError);
            upsertError = raceError;
            upsertData = null;
          }

          if (upsertError) {
            console.error('Error upserting user with wallet data:', upsertError);
            
            // More restrictive retry logic - only retry on specific network errors
            if (attempt < maxRetries && (
              upsertError.message?.includes('Failed to fetch') || 
              upsertError.message?.includes('ERR_INSUFFICIENT_RESOURCES')
            )) {
              console.log(`Network error detected, retrying in ${retryDelay}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            }
            
            throw new Error(`Wallet created but failed to save: ${upsertError.message}`);
          }

          // Verify the upsert was successful
          if (!upsertData || upsertData.length === 0) {
            console.error('Upsert claimed success but no rows were affected');
            throw new Error('Wallet data was not saved to database - upsert returned no data');
          }

          console.log('User wallet data upserted successfully:', upsertData);
          return walletData;
          
        } catch (error) {
          console.error(`Error creating wallet for user (attempt ${attempt}/${maxRetries}):`, error);
          
          const err = error as Error;
          const isRetryable = err.message.includes('Failed to fetch') || 
                             err.message.includes('ERR_INSUFFICIENT_RESOURCES') ||
                             err.message.includes('timeout');
          
          if (isRetryable && attempt < maxRetries) {
            console.log(`Retryable error detected, waiting ${retryDelay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
          
          // If not retryable or max retries reached, throw the error
          throw error;
        }
      }
    } finally {
      isCreatingWallet.current = false;
    }
  };

  // Create a memoized version of loadWalletData to prevent dependency issues
  const handleLoadWalletData = useCallback(async (userToLoad: User) => {
    // Prevent concurrent wallet loading for the same user
    if (isLoadingWallet.current || lastProcessedUserId.current === userToLoad.id) {
      console.log('Wallet loading already in progress or recently completed, skipping...');
      return;
    }
    
    isLoadingWallet.current = true;
    lastProcessedUserId.current = userToLoad.id;
    
    try {
      await loadWalletData(userToLoad);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      isLoadingWallet.current = false;
      // Reset the last processed user after a delay to allow re-loading if needed
      setTimeout(() => {
        if (lastProcessedUserId.current === userToLoad.id) {
          lastProcessedUserId.current = null;
        }
      }, 5000);
    }
  }, [loadWalletData]);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Load wallet data if user is authenticated
      if (session?.user) {
        handleLoadWalletData(session.user);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Handle email confirmation and wallet creation
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user.id);
        
        try {
          // Check if user has wallet data
          const { data: existingUser } = await supabase
            .from('users')
            .select('wallet_address, public_key')
            .eq('id', session.user.id)
            .single();
          
          if (!existingUser?.wallet_address) {
            console.log('User has no wallet - creating wallet after email confirmation');
            
            // Extract profile data from user metadata
            const profileData = session.user.user_metadata?.profile_data;
            const userData = profileData ? {
              full_name: profileData.full_name,
              phone: profileData.phone,
              country: profileData.country,
            } : undefined;
            
            console.log('Using stored profile data:', userData);
            await createWalletForUser(session.user.id, session.user.email!, userData);
          }
          
          // Load wallet data only if we didn't just create it
          if (existingUser?.wallet_address) {
            handleLoadWalletData(session.user);
          }
        } catch (error) {
          console.error('Error in SIGNED_IN handler:', error);
          // Still try to load wallet data on error
          handleLoadWalletData(session.user);
        }
      } else if (session?.user && event !== 'SIGNED_IN') {
        // Load wallet data for other events (like TOKEN_REFRESHED)
        handleLoadWalletData(session.user);
      } else if (!session?.user) {
        // Clear wallet data if user logged out
        if (user) {
          clearWalletData(user.id);
        }
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove loadWalletData and other dependencies to prevent infinite re-renders

  const signUp = async (email: string, password: string, userData?: UserData) => {
    try {
      console.log('Starting signup process for:', email);
      
      // First, create the user account with profile data in metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            // Store profile data in metadata for later use
            profile_data: userData ? {
              full_name: userData.full_name,
              phone: userData.phone,
              country: userData.country,
            } : null,
          },
        },
      });

      if (error) {
        console.error('Supabase auth signup error:', error);
        return { data, error };
      }

      if (!data.user) {
        console.error('No user returned from signup');
        return { data, error: new Error('No user returned from signup') };
      }

      console.log('User created successfully:', data.user.id);
      
      // Check if email confirmation is required
      if (!data.session) {
        console.log('Email confirmation required - wallet will be created after confirmation');
        return { data, error: null };
      }

      // If user is immediately authenticated (no email confirmation required)
      // Create wallet immediately
      console.log('User is authenticated - creating wallet now');
      
      // Extract profile data from user metadata (consistent with email confirmation flow)
      const profileData = data.user.user_metadata?.profile_data;
      const userProfileData = profileData ? {
        full_name: profileData.full_name,
        phone: profileData.phone,
        country: profileData.country,
      } : userData;
      
      console.log('Using profile data for immediate wallet creation:', userProfileData);
      await createWalletForUser(data.user.id, email, userProfileData);

      return { data, error };
    } catch (err) {
      console.error('Error in signUp:', err);
      return { data: null, error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    try {
      console.log('🔴 useAuth signOut called, user:', user?.id);
      
      // Clear wallet data before signing out
      if (user) {
        console.log('🗑️ Clearing wallet data for user:', user.id);
        await clearWalletData(user.id);
        console.log('✅ Wallet data cleared');
      } else {
        console.log('⚠️ No user found to clear wallet data');
      }
      
      console.log('🔄 Calling Supabase signOut...');
      const { error } = await supabase.auth.signOut();
      console.log('📋 Supabase signOut result - error:', error);
      
      if (!error) {
        console.log('✅ Supabase signOut successful');
      }
      
      return { error };
    } catch (err) {
      console.error('💥 Error in signOut:', err);
      return { error: err as Error };
    }
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  const createWalletManually = async () => {
    if (!user) {
      throw new Error('User must be authenticated to create wallet');
    }
    
    return await createWalletForUser(user.id, user.email!);
  };

  return {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    createWalletManually,
  };
}