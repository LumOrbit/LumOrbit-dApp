import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Country = Database['public']['Tables']['countries']['Row'];

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCountries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching countries:', error);
      } else {
        setCountries(data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const createCountry = async (countryData: Database['public']['Tables']['countries']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .insert(countryData)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setCountries(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateCountry = async (countryId: string, updates: Partial<Database['public']['Tables']['countries']['Update']>) => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .update(updates)
        .eq('id', countryId)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setCountries(prev => 
        prev.map(country => 
          country.id === countryId ? data : country
        ).sort((a, b) => a.name.localeCompare(b.name))
      );
      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteCountry = async (countryId: string) => {
    try {
      const { error } = await supabase
        .from('countries')
        .delete()
        .eq('id', countryId);

      if (error) {
        return { error };
      }

      setCountries(prev => prev.filter(country => country.id !== countryId));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const toggleCountrySupport = async (countryId: string, isSupported: boolean) => {
    return updateCountry(countryId, { is_supported: isSupported });
  };

  const updateDeliveryMethods = async (countryId: string, deliveryMethods: string[]) => {
    return updateCountry(countryId, { delivery_methods: deliveryMethods as any });
  };

  const getSupportedCountries = () => {
    return countries.filter(country => country.is_supported);
  };

  const getCountryByCode = (code: string) => {
    return countries.find(country => country.code === code);
  };

  const getCountriesByCurrency = (currency: string) => {
    return countries.filter(country => country.currency === currency);
  };

  return {
    countries,
    loading,
    createCountry,
    updateCountry,
    deleteCountry,
    toggleCountrySupport,
    updateDeliveryMethods,
    getSupportedCountries,
    getCountryByCode,
    getCountriesByCurrency,
    refetch: fetchCountries,
  };
} 