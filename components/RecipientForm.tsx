import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Mail, MapPin, CreditCard, Wallet, Star, X, Check } from 'lucide-react-native';
import { useRecipients } from '@/hooks/useRecipients';
import { useCountries } from '@/hooks/useCountries';
import { Database } from '@/lib/database.types';

type Recipient = Database['public']['Tables']['recipients']['Row'];
type RecipientInsert = Database['public']['Tables']['recipients']['Insert'];

interface RecipientFormProps {
  recipient?: Recipient;
  onClose: () => void;
  onSuccess?: (recipient: Recipient) => void;
}

const deliveryMethods = [
  { id: 'bank_transfer', name: 'Bank Transfer', icon: CreditCard },
  { id: 'cash_pickup', name: 'Cash Pickup', icon: User },
  { id: 'mobile_wallet', name: 'Mobile Wallet', icon: Wallet },
];

export default function RecipientForm({ recipient, onClose, onSuccess }: RecipientFormProps) {
  const { createRecipient, updateRecipient } = useRecipients();
  const { countries, getSupportedCountries } = useCountries();
  const isEditing = !!recipient;

  const [formData, setFormData] = useState({
    full_name: recipient?.full_name || '',
    phone: recipient?.phone || '',
    email: recipient?.email || '',
    country: recipient?.country || '',
    delivery_method: recipient?.delivery_method || '',
    bank_account: recipient?.bank_account || '',
    wallet_address: recipient?.wallet_address || '',
    is_favorite: recipient?.is_favorite || false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.delivery_method) {
      newErrors.delivery_method = 'Delivery method is required';
    }

    // Validate based on delivery method
    if (formData.delivery_method === 'bank_transfer' && !formData.bank_account.trim()) {
      newErrors.bank_account = 'Bank account is required for bank transfers';
    }

    if (formData.delivery_method === 'mobile_wallet' && !formData.wallet_address.trim()) {
      newErrors.wallet_address = 'Wallet address is required for mobile wallet';
    }

    // Validate phone or email
    if (!formData.phone.trim() && !formData.email.trim()) {
      newErrors.contact = 'Either phone number or email is required';
    }

    // Validate email format if provided
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const recipientData: RecipientInsert = {
        user_id: '', // This will be overwritten by the createRecipient function
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        country: formData.country,
        delivery_method: formData.delivery_method,
        bank_account: formData.bank_account.trim() || null,
        wallet_address: formData.wallet_address.trim() || null,
        is_favorite: formData.is_favorite,
      };

      let result;
      if (isEditing && recipient) {
        result = await updateRecipient(recipient.id, recipientData);
      } else {
        result = await createRecipient(recipientData);
      }

      if (result.error) {
        const errorMessage = result.error instanceof Error ? result.error.message : 'Failed to save recipient';
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert(
          'Success',
          `Recipient ${isEditing ? 'updated' : 'created'} successfully`,
          [{ text: 'OK', onPress: () => {
            onSuccess?.(result.data);
            onClose();
          }}]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const supportedCountries = getSupportedCountries();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditing ? 'Edit Recipient' : 'Add New Recipient'}
          </Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => updateFormData('is_favorite', !formData.is_favorite)}
          >
            <Star 
              size={24} 
              color={formData.is_favorite ? '#fbbf24' : '#6b7280'}
              fill={formData.is_favorite ? '#fbbf24' : 'none'}
            />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={[styles.inputContainer, errors.full_name && styles.inputError]}>
                <User size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.full_name}
                  onChangeText={(value) => updateFormData('full_name', value)}
                  placeholder="Enter recipient's full name"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                />
              </View>
              {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                <Phone size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  placeholder="Enter phone number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Mail size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  placeholder="Enter email address"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            {/* Country */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Country *</Text>
              <View style={styles.countryGrid}>
                {supportedCountries.map((country) => (
                  <TouchableOpacity
                    key={country.id}
                    style={[
                      styles.countryOption,
                      formData.country === country.code && styles.selectedCountry
                    ]}
                    onPress={() => updateFormData('country', country.code)}
                  >
                    <Text style={styles.countryFlag}>{country.flag_emoji}</Text>
                    <Text style={styles.countryName}>{country.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
            </View>
          </View>

          {/* Delivery Method Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Method *</Text>
            
            <View style={styles.deliveryMethods}>
              {deliveryMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = formData.delivery_method === method.id;
                
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.deliveryMethod,
                      isSelected && styles.selectedDeliveryMethod
                    ]}
                    onPress={() => updateFormData('delivery_method', method.id)}
                  >
                    <Icon size={24} color={isSelected ? '#2563eb' : '#6b7280'} />
                    <Text style={[
                      styles.deliveryMethodText,
                      isSelected && styles.selectedDeliveryMethodText
                    ]}>
                      {method.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.delivery_method && <Text style={styles.errorText}>{errors.delivery_method}</Text>}
          </View>

          {/* Delivery Details Section */}
          {formData.delivery_method && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Details</Text>
              
              {formData.delivery_method === 'bank_transfer' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Bank Account Details *</Text>
                  <View style={[styles.inputContainer, errors.bank_account && styles.inputError]}>
                    <CreditCard size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.bank_account}
                      onChangeText={(value) => updateFormData('bank_account', value)}
                      placeholder="Enter bank account information"
                      placeholderTextColor="#9ca3af"
                      multiline
                    />
                  </View>
                  {errors.bank_account && <Text style={styles.errorText}>{errors.bank_account}</Text>}
                </View>
              )}

              {formData.delivery_method === 'mobile_wallet' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Wallet Address *</Text>
                  <View style={[styles.inputContainer, errors.wallet_address && styles.inputError]}>
                    <Wallet size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.wallet_address}
                      onChangeText={(value) => updateFormData('wallet_address', value)}
                      placeholder="Enter wallet address"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.wallet_address && <Text style={styles.errorText}>{errors.wallet_address}</Text>}
                </View>
              )}

              {formData.delivery_method === 'cash_pickup' && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoText}>
                    Cash pickup is available at partner locations in the selected country. 
                    The recipient will need to bring valid ID to collect the money.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Check size={20} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add Recipient')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  form: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    margin: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCountry: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f9ff',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  deliveryMethods: {
    marginTop: 8,
  },
  deliveryMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDeliveryMethod: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f9ff',
  },
  deliveryMethodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 12,
  },
  selectedDeliveryMethodText: {
    color: '#2563eb',
  },
  infoCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
}); 