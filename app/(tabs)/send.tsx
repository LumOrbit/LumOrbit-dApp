import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ChevronRight, MapPin, User, CreditCard, Clock } from 'lucide-react-native';

export default function SendScreen() {
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const countries = [
    { code: 'MX', name: 'Mexico', flag: '🇲🇽', rate: '18.45' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭', rate: '56.20' },
    { code: 'IN', name: 'India', flag: '🇮🇳', rate: '83.12' },
    { code: 'GT', name: 'Guatemala', flag: '🇬🇹', rate: '7.85' },
  ];

  const savedRecipients = [
    { name: 'Maria Rodriguez', location: 'Mexico City, MX' },
    { name: 'José García', location: 'Guadalajara, MX' },
    { name: 'Ana Santos', location: 'Manila, PH' },
  ];

  const deliveryMethods = [
    { id: 'bank', name: 'Bank Transfer', time: '1-2 business days', fee: '$2.99' },
    { id: 'cash', name: 'Cash Pickup', time: 'Within hours', fee: '$4.99' },
    { id: 'wallet', name: 'Mobile Wallet', time: 'Instant', fee: '$1.99' },
  ];

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((stepNum) => (
        <View key={stepNum} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            { backgroundColor: step >= stepNum ? '#2563eb' : '#e5e7eb' }
          ]}>
            <Text style={[
              styles.stepText,
              { color: step >= stepNum ? '#ffffff' : '#9ca3af' }
            ]}>
              {stepNum}
            </Text>
          </View>
          {stepNum < 4 && (
            <View style={[
              styles.stepLine,
              { backgroundColor: step > stepNum ? '#2563eb' : '#e5e7eb' }
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Destination Country</Text>
      <Text style={styles.stepSubtitle}>Where are you sending money?</Text>
      
      <View style={styles.countriesGrid}>
        {countries.map((country) => (
          <TouchableOpacity
            key={country.code}
            style={[
              styles.countryCard,
              selectedCountry === country.code && styles.selectedCountryCard
            ]}
            onPress={() => setSelectedCountry(country.code)}
          >
            <Text style={styles.countryFlag}>{country.flag}</Text>
            <Text style={styles.countryName}>{country.name}</Text>
            <Text style={styles.countryRate}>1 USD = {country.rate}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !selectedCountry && styles.disabledButton]}
        disabled={!selectedCountry}
        onPress={() => setStep(2)}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Enter Amount</Text>
      <Text style={styles.stepSubtitle}>How much do you want to send?</Text>
      
      <View style={styles.amountContainer}>
        <Text style={styles.currencyLabel}>USD</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.conversionCard}>
        <Text style={styles.conversionText}>
          Recipient will receive: {amount ? (parseFloat(amount) * 18.45).toFixed(2) : '0.00'} MXN
        </Text>
        <Text style={styles.feeText}>Transfer fee: $2.99</Text>
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !amount && styles.disabledButton]}
          disabled={!amount}
          onPress={() => setStep(3)}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Recipient</Text>
      <Text style={styles.stepSubtitle}>Who are you sending money to?</Text>
      
      <TouchableOpacity style={styles.addRecipientButton}>
        <User size={24} color="#2563eb" />
        <Text style={styles.addRecipientText}>Add New Recipient</Text>
        <ChevronRight size={20} color="#6b7280" />
      </TouchableOpacity>

      <Text style={styles.savedRecipientsTitle}>Saved Recipients</Text>
      {savedRecipients.map((rec, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.recipientCard,
            recipient === rec.name && styles.selectedRecipientCard
          ]}
          onPress={() => setRecipient(rec.name)}
        >
          <View style={styles.recipientAvatar}>
            <Text style={styles.recipientInitial}>{rec.name.charAt(0)}</Text>
          </View>
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientName}>{rec.name}</Text>
            <Text style={styles.recipientLocation}>{rec.location}</Text>
          </View>
          <ChevronRight size={20} color="#6b7280" />
        </TouchableOpacity>
      ))}

      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !recipient && styles.disabledButton]}
          disabled={!recipient}
          onPress={() => setStep(4)}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Delivery Method</Text>
      <Text style={styles.stepSubtitle}>How should the recipient receive the money?</Text>
      
      {deliveryMethods.map((method) => (
        <TouchableOpacity key={method.id} style={styles.deliveryCard}>
          <View style={styles.deliveryIcon}>
            <CreditCard size={24} color="#2563eb" />
          </View>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryName}>{method.name}</Text>
            <View style={styles.deliveryDetails}>
              <Clock size={16} color="#6b7280" />
              <Text style={styles.deliveryTime}>{method.time}</Text>
            </View>
          </View>
          <Text style={styles.deliveryFee}>{method.fee}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Transfer Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount:</Text>
          <Text style={styles.summaryValue}>${amount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Fee:</Text>
          <Text style={styles.summaryValue}>$2.99</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total:</Text>
          <Text style={styles.summaryTotal}>${(parseFloat(amount) + 2.99).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(3)}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send Money</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Send Money</Text>
          <Text style={styles.subtitle}>Safe, fast, and low-cost transfers</Text>
        </View>

        {renderStepIndicator()}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
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
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  stepContent: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  countriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  countryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCountryCard: {
    borderColor: '#2563eb',
  },
  countryFlag: {
    fontSize: 32,
    marginBottom: 8,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  countryRate: {
    fontSize: 12,
    color: '#6b7280',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currencyLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  conversionCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  conversionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  feeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  addRecipientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addRecipientText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 12,
  },
  savedRecipientsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  recipientCard: {
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
  selectedRecipientCard: {
    borderColor: '#2563eb',
  },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipientInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  recipientLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  deliveryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  deliveryFee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  stepButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flex: 0.4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flex: 0.55,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  sendButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flex: 0.55,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
});