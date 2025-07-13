import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function VerifyEmailScreen() {
  const [resending, setResending] = useState(false);
  const { user } = useAuth();

  const handleResendEmail = async () => {
    setResending(true);
    // Simulate resending email
    setTimeout(() => {
      setResending(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <Mail size={48} color="#2563eb" />
          </View>
          
          <Text style={styles.title}>Check Your Email</Text>
          
          <Text style={styles.message}>
            We've sent a verification link to{'\n'}
            <Text style={styles.email}>{user?.email}</Text>
          </Text>
          
          <Text style={styles.instructions}>
            Please check your email and click the verification link to activate your account. 
            You may need to check your spam folder.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.resendButton, resending && styles.disabledButton]}
              onPress={handleResendEmail}
              disabled={resending}
            >
              <RefreshCw size={20} color="#2563eb" style={styles.buttonIcon} />
              <Text style={styles.resendButtonText}>
                {resending ? 'Sending...' : 'Resend Email'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text style={styles.continueButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Didn't receive the email?</Text>
            <Text style={styles.helpText}>
              • Check your spam or junk folder{'\n'}
              • Make sure you entered the correct email address{'\n'}
              • Contact support if you continue having issues
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 Your account security is our priority
          </Text>
        </View>
      </View>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
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
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
    color: '#2563eb',
  },
  instructions: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  actions: {
    width: '100%',
    marginBottom: 40,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  continueButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  helpSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});