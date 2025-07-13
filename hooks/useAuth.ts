import { useEffect, useState } from 'react';
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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Load wallet data if user is authenticated
      if (session?.user) {
        loadWalletData(session.user);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Load wallet data if user is authenticated
      if (session?.user) {
        loadWalletData(session.user);
      } else {
        // Clear wallet data if user logged out
        if (user) {
          clearWalletData(user.id);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadWalletData, clearWalletData, user]);

  const signUp = async (email: string, password: string, userData?: UserData) => {
    try {
      // First, create the user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        return { data, error };
      }

      // If user creation was successful, create invisible wallet
      if (data.user) {
        console.log('Creating invisible wallet for user:', data.user.id);
        
        const walletData = await createInvisibleWallet(data.user.id, email);
        
        if (walletData) {
          console.log('Invisible wallet created successfully');
          
          // Update user record with wallet information
          const { error: updateError } = await supabase
            .from('users')
            .update({
              wallet_address: walletData.walletAddress,
              public_key: walletData.publicKey,
              private_key: walletData.encryptedPrivateKey,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id);

          if (updateError) {
            console.error('Error updating user with wallet data:', updateError);
            // Don't return error here, as the user was created successfully
          } else {
            console.log('User wallet data updated successfully');
          }
        } else {
          console.error('Failed to create invisible wallet');
          // Don't return error here, as the user was created successfully
        }
      }

      return { data, error };
    } catch (err) {
      console.error('Error in signUp with invisible wallet:', err);
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
      // Clear wallet data before signing out
      if (user) {
        await clearWalletData(user.id);
      }
      
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      console.error('Error in signOut:', err);
      return { error: err as Error };
    }
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  return {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
}