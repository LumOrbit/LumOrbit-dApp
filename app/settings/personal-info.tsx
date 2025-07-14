import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Save, Edit3 } from 'lucide-react-native';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCountries } from '@/hooks/useCountries';

export default function PersonalInfoScreen() {
  const { profile, updatePersonalInfo, loading: profileLoading } = useUserProfile();
  const { countries, getSupportedCountries } = useCountries();
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: '',
  });

  const supportedCountries = getSupportedCountries();

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
      });
    }
  }, [profile]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!formData.country) {
      Alert.alert('Error', 'Please select your country');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const result = await updatePersonalInfo(
        formData.fullName,
        formData.phone,
        formData.country
      );

      if (result.error) {
        Alert.alert('Error', 'Failed to update personal information. Please try again.');
      } else {
        Alert.alert('Success', 'Personal information updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
      });
    }
    setIsEditing(false);
  };

  const getCountryName = (countryCode: string) => {
    const country = supportedCountries.find(c => c.code === countryCode);
    return country?.name || countryCode;
  };

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Personal Information</Text>
          <Text style={styles.subtitle}>
            Keep your personal details up to date for a better experience
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldHeader}>
              <View style={styles.fieldLabelContainer}>
                <User size={16} color="#6b7280" />
                <Text style={styles.fieldLabel}>Full Name</Text>
              </View>
            </View>
            
            {isEditing ? (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.fullName}
                  onChangeText={(value) => updateFormData('fullName', value)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                />
              </View>
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.fieldValue}>
                  {profile?.full_name || 'Not set'}
                </Text>
              </View>
            )}
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldHeader}>
              <View style={styles.fieldLabelContainer}>
                <Phone size={16} color="#6b7280" />
                <Text style={styles.fieldLabel}>Phone Number</Text>
              </View>
            </View>
            
            {isEditing ? (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.fieldValue}>
                  {profile?.phone || 'Not set'}
                </Text>
              </View>
            )}
          </View>

          {/* Country */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldHeader}>
              <View style={styles.fieldLabelContainer}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.fieldLabel}>Country</Text>
              </View>
            </View>
            
            {isEditing ? (
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select Country</Text>
                <ScrollView style={styles.countryList} showsVerticalScrollIndicator={false}>
                  {supportedCountries.map((country) => (
                    <TouchableOpacity
                      key={country.code}
                      style={[
                        styles.countryOption,
                        formData.country === country.code && styles.selectedCountryOption
                      ]}
                      onPress={() => updateFormData('country', country.code)}
                    >
                      <Text style={styles.countryFlag}>{country.flag_emoji}</Text>
                      <Text style={[
                        styles.countryName,
                        formData.country === country.code && styles.selectedCountryName
                      ]}>
                        {country.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.fieldValue}>
                  {profile?.country ? getCountryName(profile.country) : 'Not set'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isEditing ? (
            <View style={styles.editingButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Save size={16} color="#ffffff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Edit3 size={16} color="#2563eb" />
              <Text style={styles.editButtonText}>Edit Information</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Why we need this information</Text>
          <Text style={styles.infoText}>
            • Your full name is used for identity verification and transfer documentation{'\n'}
            • Phone number helps us notify you about transfer updates{'\n'}
            • Country information ensures we show you relevant transfer options
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  valueContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fieldValue: {
    fontSize: 16,
    color: '#1f2937',
  },
  pickerContainer: {
    maxHeight: 200,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  countryList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedCountryOption: {
    backgroundColor: '#f0f9ff',
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 12,
  },
  countryName: {
    fontSize: 16,
    color: '#374151',
  },
  selectedCountryName: {
    color: '#2563eb',
    fontWeight: '600',
  },
  actionButtons: {
    marginBottom: 20,
  },
  editingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  disabledButton: {
    opacity: 0.6,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
}); 