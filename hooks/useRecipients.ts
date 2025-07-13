import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Database } from '@/lib/database.types';

type Recipient = Database['public']['Tables']['recipients']['Row'];

export function useRecipients() {
  const { user } = useAuth();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecipients();
    } else {
      setRecipients([]);
      setLoading(false);
    }
  }, [user]);

  const fetchRecipients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recipients:', error);
      } else {
        setRecipients(data);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRecipient = async (recipientData: Database['public']['Tables']['recipients']['Insert']) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('recipients')
        .insert({
          ...recipientData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return { error };
      }

      setRecipients(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateRecipient = async (recipientId: string, updates: Partial<Recipient>) => {
    try {
      const { data, error } = await supabase
        .from('recipients')
        .update(updates)
        .eq('id', recipientId)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setRecipients(prev => 
        prev.map(recipient => 
          recipient.id === recipientId ? data : recipient
        )
      );
      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteRecipient = async (recipientId: string) => {
    try {
      const { error } = await supabase
        .from('recipients')
        .delete()
        .eq('id', recipientId);

      if (error) {
        return { error };
      }

      setRecipients(prev => prev.filter(recipient => recipient.id !== recipientId));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    recipients,
    loading,
    createRecipient,
    updateRecipient,
    deleteRecipient,
    refetch: fetchRecipients,
  };
}