import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Database } from '@/lib/database.types';

type Transfer = Database['public']['Tables']['transfers']['Row'] & {
  recipient: Database['public']['Tables']['recipients']['Row'];
};

export function useTransfers() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransfers = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          recipient:recipients(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transfers:', error);
      } else {
        setTransfers(data as Transfer[]);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTransfers();
    } else {
      setTransfers([]);
      setLoading(false);
    }
  }, [user, fetchTransfers]);

  const createTransfer = async (transferData: Database['public']['Tables']['transfers']['Insert']) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('transfers')
        .insert({
          ...transferData,
          user_id: user.id,
        })
        .select(`
          *,
          recipient:recipients(*)
        `)
        .single();

      if (error) {
        return { error };
      }

      setTransfers(prev => [data as Transfer, ...prev]);
      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateTransferStatus = async (transferId: string, status: string, stellarTxId?: string) => {
    try {
      const updates: Partial<Database['public']['Tables']['transfers']['Update']> = { status };
      if (stellarTxId) {
        updates.stellar_transaction_id = stellarTxId;
      }
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('transfers')
        .update(updates)
        .eq('id', transferId)
        .select(`
          *,
          recipient:recipients(*)
        `)
        .single();

      if (error) {
        return { error };
      }

      setTransfers(prev => 
        prev.map(transfer => 
          transfer.id === transferId ? data as Transfer : transfer
        )
      );
      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateTransfer = async (transferId: string, updates: Partial<Database['public']['Tables']['transfers']['Update']>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('transfers')
        .update(updateData)
        .eq('id', transferId)
        .eq('user_id', user.id) // Ensure user can only update their own transfers
        .select(`
          *,
          recipient:recipients(*)
        `)
        .single();

      if (error) {
        return { error };
      }

      setTransfers(prev => 
        prev.map(transfer => 
          transfer.id === transferId ? data as Transfer : transfer
        )
      );
      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteTransfer = async (transferId: string) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('transfers')
        .delete()
        .eq('id', transferId)
        .eq('user_id', user.id); // Ensure user can only delete their own transfers

      if (error) {
        return { error };
      }

      setTransfers(prev => prev.filter(transfer => transfer.id !== transferId));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const cancelTransfer = async (transferId: string) => {
    return updateTransferStatus(transferId, 'cancelled');
  };

  return {
    transfers,
    loading,
    createTransfer,
    updateTransfer,
    updateTransferStatus,
    deleteTransfer,
    cancelTransfer,
    refetch: fetchTransfers,
  };
}