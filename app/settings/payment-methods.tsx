import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { CreditCard, Plus, Trash2, Star, Edit3, X, Building, User } from 'lucide-react-native';

interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'credit_card' | 'debit_card';
  name: string;
  accountNumber: string;
  bankName?: string;
  isDefault: boolean;
  lastUsed?: string;
}

interface AddPaymentFormData {
  type: 'bank_account' | 'credit_card' | 'debit_card';
  name: string;
  accountNumber: string;
  bankName: string;
  routingNumber: string;
  accountHolderName: string;
}

export default function PaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'bank_account',
      name: 'Primary Checking',
      accountNumber: '****1234',
      bankName: 'Chase Bank',
      isDefault: true,
      lastUsed: '2024-01-15',
    },
    {
      id: '2',
      type: 'credit_card',
      name: 'Visa Credit',
      accountNumber: '****5678',
      bankName: 'Capital One',
      isDefault: false,
      lastUsed: '2024-01-10',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddPaymentFormData>({
    type: 'bank_account',
    name: '',
    accountNumber: '',
    bankName: '',
    routingNumber: '',
    accountHolderName: '',
  });

  const updateFormData = (field: keyof AddPaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      type: 'bank_account',
      name: '',
      accountNumber: '',
      bankName: '',
      routingNumber: '',
      accountHolderName: '',
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name for this payment method');
      return false;
    }
    if (!formData.accountNumber.trim()) {
      Alert.alert('Error', 'Please enter an account number');
      return false;
    }
    if (!formData.accountHolderName.trim()) {
      Alert.alert('Error', 'Please enter the account holder name');
      return false;
    }
    if (formData.type === 'bank_account') {
      if (!formData.bankName.trim()) {
        Alert.alert('Error', 'Please enter the bank name');
        return false;
      }
      if (!formData.routingNumber.trim()) {
        Alert.alert('Error', 'Please enter the routing number');
        return false;
      }
    }
    return true;
  };

  const handleAddPaymentMethod = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newPaymentMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: formData.type,
        name: formData.name,
        accountNumber: `****${formData.accountNumber.slice(-4)}`,
        bankName: formData.bankName || undefined,
        isDefault: paymentMethods.length === 0,
      };

      setPaymentMethods(prev => [...prev, newPaymentMethod]);
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Payment method added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (!method) return;

    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to remove ${method.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(m => m.id !== id));
          }
        }
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    Alert.alert('Success', 'Default payment method updated');
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'bank_account':
        return <Building size={20} color="#2563eb" />;
      case 'credit_card':
      case 'debit_card':
        return <CreditCard size={20} color="#2563eb" />;
      default:
        return <CreditCard size={20} color="#2563eb" />;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'bank_account':
        return 'Bank Account';
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      default:
        return type;
    }
  };

  const paymentTypeOptions = [
    { value: 'bank_account', label: 'Bank Account' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payment Methods</Text>
          <Text style={styles.subtitle}>
            Manage your payment methods for sending money and funding transfers
          </Text>
        </View>

        {/* Add Payment Method Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#2563eb" />
          <Text style={styles.addButtonText}>Add New Payment Method</Text>
        </TouchableOpacity>

        {/* Payment Methods List */}
        <View style={styles.paymentMethodsList}>
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodHeader}>
                <View style={styles.paymentMethodInfo}>
                  <View style={styles.paymentMethodIcon}>
                    {getPaymentIcon(method.type)}
                  </View>
                  <View style={styles.paymentMethodDetails}>
                    <View style={styles.paymentMethodTitleRow}>
                      <Text style={styles.paymentMethodName}>{method.name}</Text>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Star size={12} color="#ffffff" />
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.paymentMethodType}>
                      {getPaymentTypeLabel(method.type)}
                    </Text>
                    <Text style={styles.paymentMethodAccount}>
                      {method.bankName && `${method.bankName} • `}{method.accountNumber}
                    </Text>
                    {method.lastUsed && (
                      <Text style={styles.lastUsed}>
                        Last used: {new Date(method.lastUsed).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.paymentMethodActions}>
                  {!method.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(method.id)}
                    >
                      <Star size={16} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeletePaymentMethod(method.id)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {paymentMethods.length === 0 && (
            <View style={styles.emptyState}>
              <CreditCard size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Payment Methods</Text>
              <Text style={styles.emptySubtitle}>
                Add a payment method to start sending money
              </Text>
            </View>
          )}
        </View>

        {/* Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Important Information</Text>
          <Text style={styles.infoText}>
            • Bank accounts are the most cost-effective option for funding transfers{'\n'}
            • Credit cards may incur additional fees{'\n'}
            • All payment information is encrypted and secure{'\n'}
            • You can set any payment method as your default
          </Text>
        </View>
      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Payment Method</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Payment Type Selection */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Payment Type</Text>
              <View style={styles.typeSelector}>
                {paymentTypeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.typeOption,
                      formData.type === option.value && styles.selectedTypeOption
                    ]}
                    onPress={() => updateFormData('type', option.value as any)}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      formData.type === option.value && styles.selectedTypeOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Payment Details</Text>

              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  placeholder="e.g., Primary Checking"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Account Holder Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Holder Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.accountHolderName}
                  onChangeText={(value) => updateFormData('accountHolderName', value)}
                  placeholder="Full name on account"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                />
              </View>

              {/* Account Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {formData.type === 'bank_account' ? 'Account Number' : 'Card Number'} *
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.accountNumber}
                  onChangeText={(value) => updateFormData('accountNumber', value)}
                  placeholder={formData.type === 'bank_account' ? "Account number" : "Card number"}
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  secureTextEntry={formData.type !== 'bank_account'}
                />
              </View>

              {/* Bank-specific fields */}
              {formData.type === 'bank_account' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Bank Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.bankName}
                      onChangeText={(value) => updateFormData('bankName', value)}
                      placeholder="Name of your bank"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Routing Number *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.routingNumber}
                      onChangeText={(value) => updateFormData('routingNumber', value)}
                      placeholder="9-digit routing number"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      maxLength={9}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addModalButton, loading && styles.disabledButton]}
                onPress={handleAddPaymentMethod}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Plus size={16} color="#ffffff" />
                    <Text style={styles.addModalButtonText}>Add Payment Method</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    marginBottom: 20,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  paymentMethodsList: {
    gap: 12,
    marginBottom: 20,
  },
  paymentMethodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 16,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  paymentMethodType: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  paymentMethodAccount: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  lastUsed: {
    fontSize: 12,
    color: '#9ca3af',
  },
  paymentMethodActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  selectedTypeOption: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f9ff',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedTypeOptionText: {
    color: '#2563eb',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 20,
  },
  cancelModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  addModalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    gap: 8,
  },
  addModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.6,
  },
}); 