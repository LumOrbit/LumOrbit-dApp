import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Database } from '@/lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const createProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          preferred_language: 'en',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  }, [user]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // User profile doesn't exist, create one
        await createProfile();
      } else if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user, createProfile]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user, fetchProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setProfile(data);
      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteProfile = async () => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // First, we should probably archive or soft delete rather than hard delete
      // But for complete CRUD, here's the hard delete option
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      setProfile(null);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateWalletInfo = async (walletAddress: string, publicKey: string, encryptedPrivateKey: string) => {
    return updateProfile({
      wallet_address: walletAddress,
      public_key: publicKey,
      private_key: encryptedPrivateKey
    });
  };

  const updateVerificationStatus = async (isVerified: boolean) => {
    return updateProfile({ is_verified: isVerified });
  };

  const updatePersonalInfo = async (fullName: string, phone?: string, country?: string) => {
    const updates: Partial<UserProfile> = { full_name: fullName };
    if (phone) updates.phone = phone;
    if (country) updates.country = country;
    return updateProfile(updates);
  };

  const updatePreferences = async (preferredLanguage: string) => {
    return updateProfile({ preferred_language: preferredLanguage });
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    return !!(profile.full_name && profile.phone && profile.country);
  };

  const hasWallet = () => {
    if (!profile) return false;
    return !!(profile.wallet_address && profile.public_key);
  };

  const isVerified = () => {
    if (!profile) return false;
    return profile.is_verified;
  };

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    deleteProfile,
    updateWalletInfo,
    updateVerificationStatus,
    updatePersonalInfo,
    updatePreferences,
    isProfileComplete,
    hasWallet,
    isVerified,
    refetch: fetchProfile,
  };
}