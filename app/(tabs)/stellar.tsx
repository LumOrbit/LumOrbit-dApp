import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import StellarAccountDetails from '@/components/StellarAccountDetails';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StellarScreen() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [stellarPublicKey, setStellarPublicKey] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStellarWallet();
  }, [user]);

  const loadStellarWallet = async () => {
    try {
      if (!user) return;
      
      // Try to get from profile first
      if (profile?.stellar_public_key) {
        setStellarPublicKey(profile.stellar_public_key);
        setLoading(false);
        return;
      }

      // Fallback to AsyncStorage
      const walletData = await AsyncStorage.getItem(`stellar_wallet_${user.id}`);
      if (walletData) {
        const wallet = JSON.parse(walletData);
        setStellarPublicKey(wallet.publicKey);
      } else {
        Alert.alert('Error', 'No Stellar wallet found. Please contact support.');
      }
    } catch (error) {
      console.error('Error loading Stellar wallet:', error);
      Alert.alert('Error', 'Failed to load Stellar wallet data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Stellar Account...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stellarPublicKey) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>No Stellar Account Found</Text>
          <Text style={styles.errorText}>
            Please ensure you have completed the registration process to create your Stellar wallet.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StellarAccountDetails 
        publicKey={stellarPublicKey}
        onRefresh={loadStellarWallet}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 