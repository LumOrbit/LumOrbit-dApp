import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { X, Search, TrendingUp } from 'lucide-react-native';
import Flag from 'react-native-round-flags';
import { useExchangeRates } from '@/hooks/useExchangeRates';

interface Country {
  id: string;
  code: string;
  name: string;
  currency: string;
  flag_emoji: string;
  is_supported: boolean;
}

interface CountrySelectorProps {
  countries: Country[];
  selectedCountry: string;
  onSelectCountry: (countryCode: string) => void;
  onClose: () => void;
}

export default function CountrySelector({
  countries,
  selectedCountry,
  onSelectCountry,
  onClose,
}: CountrySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { getRate } = useExchangeRates();

  // Popular countries (most commonly used for remittances)
  const popularCountryCodes = ['MX', 'PH', 'IN', 'GT', 'BR', 'CO', 'PE', 'EG'];

  const filteredCountries = useMemo(() => {
    let filtered = countries;

    if (searchQuery.trim()) {
      filtered = countries.filter(
        country =>
          country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [countries, searchQuery]);

  const popularCountries = useMemo(() => {
    return countries
      .filter(country => popularCountryCodes.includes(country.code))
      .sort((a, b) => {
        const aIndex = popularCountryCodes.indexOf(a.code);
        const bIndex = popularCountryCodes.indexOf(b.code);
        return aIndex - bIndex;
      });
  }, [countries]);

  const otherCountries = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredCountries;
    }
    return filteredCountries.filter(country => !popularCountryCodes.includes(country.code));
  }, [filteredCountries, searchQuery]);

  const renderCountryItem = (country: Country) => {
    const exchangeRateData = getRate('USD', country.currency);
    const exchangeRate = exchangeRateData?.rate || 1;
    const isSelected = selectedCountry === country.code;

    return (
      <TouchableOpacity
        key={country.code}
        style={[styles.countryItem, isSelected && styles.selectedCountryItem]}
        onPress={() => onSelectCountry(country.code)}
      >
        <View style={styles.flagContainer}>
          <Flag code={country.code} style={styles.flagImage} />
        </View>
        <View style={styles.countryInfo}>
          <Text style={styles.countryName}>{country.name}</Text>
          <Text style={styles.currencyInfo}>
            {country.currency} • 1 USD = {exchangeRate.toFixed(4)}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <View style={styles.selectedDot} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Country</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries or currencies..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Countries List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!searchQuery.trim() && popularCountries.length > 0 && (
          <>
            {/* Popular Countries */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={16} color="#2563eb" />
                <Text style={styles.sectionTitle}>Popular destinations</Text>
              </View>
              {popularCountries.map(renderCountryItem)}
            </View>

            {/* Divider */}
            <View style={styles.divider} />
          </>
        )}

        {/* All Countries or Search Results */}
        <View style={styles.section}>
          {!searchQuery.trim() && (
            <Text style={styles.sectionTitle}>All countries</Text>
          )}
          {searchQuery.trim() && filteredCountries.length > 0 && (
            <Text style={styles.sectionTitle}>
              {filteredCountries.length} result{filteredCountries.length !== 1 ? 's' : ''}
            </Text>
          )}
          
          {(searchQuery.trim() ? filteredCountries : otherCountries).map(renderCountryItem)}
          
          {searchQuery.trim() && filteredCountries.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No countries found</Text>
              <Text style={styles.emptyStateText}>
                Try searching with a different country name or currency code
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
    marginTop: 24,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCountryItem: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f9ff',
  },
  flagContainer: {
    marginRight: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagImage: {
    width: 32,
    height: 32,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  currencyInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  selectedDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
}); 