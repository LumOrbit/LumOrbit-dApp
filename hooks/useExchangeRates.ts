import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type ExchangeRate = Database['public']['Tables']['exchange_rates']['Row'];

export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRates();
    
    // Set up real-time subscription for rate updates
    const subscription = supabase
      .channel('exchange_rates_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exchange_rates',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setRates(prev => 
              prev.map(rate => 
                rate.id === payload.new.id ? payload.new as ExchangeRate : rate
              )
            );
          } else if (payload.eventType === 'INSERT') {
            setRates(prev => [...prev, payload.new as ExchangeRate]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRates = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('from_currency', 'USD')
        .order('to_currency');

      if (error) {
        console.error('Error fetching exchange rates:', error);
      } else {
        setRates(data);
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRate = (fromCurrency: string, toCurrency: string) => {
    return rates.find(rate => 
      rate.from_currency === fromCurrency && rate.to_currency === toCurrency
    );
  };

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string) => {
    const rate = getRate(fromCurrency, toCurrency);
    if (!rate) return null;
    return amount * rate.rate;
  };

  return {
    rates,
    loading,
    getRate,
    convertAmount,
    refetch: fetchRates,
  };
}

const createExchangeRate = async (rateData: Database['public']['Tables']['exchange_rates']['Insert']) => {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .insert({
        ...rateData,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return { error };
    }

    return { data, error: null };
  } catch (error) {
    return { error };
  }
};

const updateExchangeRate = async (rateId: string, updates: Partial<Database['public']['Tables']['exchange_rates']['Update']>) => {
  try {
    const updateData = {
      ...updates,
      last_updated: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('exchange_rates')
      .update(updateData)
      .eq('id', rateId)
      .select()
      .single();

    if (error) {
      return { error };
    }

    return { data, error: null };
  } catch (error) {
    return { error };
  }
};

const updateExchangeRateByCurrency = async (fromCurrency: string, toCurrency: string, rate: number, change24h?: number) => {
  try {
    const updateData: Database['public']['Tables']['exchange_rates']['Update'] = {
      rate,
      last_updated: new Date().toISOString()
    };
    
    if (change24h !== undefined) {
      updateData.change_24h = change24h;
    }

    const { data, error } = await supabase
      .from('exchange_rates')
      .update(updateData)
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .select()
      .single();

    if (error) {
      return { error };
    }

    return { data, error: null };
  } catch (error) {
    return { error };
  }
};

const deleteExchangeRate = async (rateId: string) => {
  try {
    const { error } = await supabase
      .from('exchange_rates')
      .delete()
      .eq('id', rateId);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};

const batchUpdateExchangeRates = async (rates: Array<{fromCurrency: string, toCurrency: string, rate: number, change24h?: number}>) => {
  try {
    const updatePromises = rates.map(rateUpdate => 
      updateExchangeRateByCurrency(rateUpdate.fromCurrency, rateUpdate.toCurrency, rateUpdate.rate, rateUpdate.change24h)
    );

    const results = await Promise.allSettled(updatePromises);
    const errors = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && result.value.error));
    
    if (errors.length > 0) {
      return { error: new Error(`Failed to update ${errors.length} exchange rates`) };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Export standalone functions for admin/system use
export { 
  createExchangeRate, 
  updateExchangeRate, 
  updateExchangeRateByCurrency, 
  deleteExchangeRate, 
  batchUpdateExchangeRates 
};