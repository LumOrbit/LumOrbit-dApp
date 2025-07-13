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