import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Wallet, RefreshCw, Copy, Eye, EyeOff } from 'lucide-react-native';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';

interface WalletDisplayProps {
  showPrivateKey?: boolean;
}

export default function WalletDisplay({ showPrivateKey = false }: WalletDisplayProps) {
  const { user } = useAuth();
  const { walletData, isLoading, error, loadWalletData, refreshBalance, getPrivateKey } = useStellarWallet();
  const [showSecret, setShowSecret] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  // Memoize the loadWalletData call to prevent excessive calls
  const handleLoadWalletData = useCallback(() => {
    if (user && !isLoading) {
      loadWalletData(user);
    }
  }, [user, loadWalletData, isLoading]);

  useEffect(() => {
    // Only load wallet data if we have a user and no wallet data yet
    if (user && !walletData && !isLoading) {
      handleLoadWalletData();
    }
  }, [user, walletData, isLoading]); // Remove loadWalletData from dependency array

  const handleCopyAddress = async () => {
    if (walletData?.walletAddress) {
      await Clipboard.setStringAsync(walletData.walletAddress);
      Alert.alert('Copied!', 'Wallet address copied to clipboard');
    }
  };

  const handleCopyPrivateKey = async () => {
    if (privateKey) {
      await Clipboard.setStringAsync(privateKey);
      Alert.alert('Copied!', 'Private key copied to clipboard');
    }
  };

  const handleShowPrivateKey = async () => {
    if (!user) return;
    
    if (showSecret && privateKey) {
      setShowSecret(false);
      setPrivateKey(null);
      return;
    }

    try {
      const key = await getPrivateKey(user.id, user.email!);
      if (key) {
        setPrivateKey(key);
        setShowSecret(true);
      } else {
        Alert.alert('Error', 'Could not retrieve private key');
      }
    } catch {
      Alert.alert('Error', 'Failed to decrypt private key');
    }
  };

  const handleRefresh = async () => {
    await refreshBalance();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!walletData) {
    return (
      <View style={styles.noWalletContainer}>
        <Wallet size={48} color="#9ca3af" />
        <Text style={styles.noWalletText}>No wallet found</Text>
        <Text style={styles.noWalletSubtext}>
          Your wallet will be automatically created when you register
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Wallet size={24} color="#2563eb" />
          <Text style={styles.title}>Stellar Wallet</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <RefreshCw size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceAmount}>{walletData.balance.toFixed(7)} XLM</Text>
        <View style={[styles.statusBadge, walletData.isActivated ? styles.activatedBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, walletData.isActivated ? styles.activatedText : styles.inactiveText]}>
            {walletData.isActivated ? 'Activated' : 'Not Activated'}
          </Text>
        </View>
      </View>

      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Public Address</Text>
        <View style={styles.addressRow}>
          <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
            {walletData.walletAddress}
          </Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyAddress}>
            <Copy size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {showPrivateKey && (
        <View style={styles.privateKeyContainer}>
          <Text style={styles.privateKeyLabel}>Private Key</Text>
          <View style={styles.privateKeyRow}>
            <Text style={styles.privateKeyText} numberOfLines={1} ellipsizeMode="middle">
              {showSecret ? privateKey : '•'.repeat(56)}
            </Text>
            <TouchableOpacity style={styles.eyeButton} onPress={handleShowPrivateKey}>
              {showSecret ? <EyeOff size={16} color="#6b7280" /> : <Eye size={16} color="#6b7280" />}
            </TouchableOpacity>
            {showSecret && (
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyPrivateKey}>
                <Copy size={16} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
          {!walletData.isActivated && (
            <Text style={styles.warningText}>
              ⚠️ Account needs to be funded with at least 1 XLM to be activated
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  noWalletContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noWalletText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  noWalletSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  refreshButton: {
    padding: 8,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activatedBadge: {
    backgroundColor: '#d1fae5',
  },
  inactiveBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activatedText: {
    color: '#065f46',
  },
  inactiveText: {
    color: '#991b1b',
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  privateKeyContainer: {
    marginTop: 16,
  },
  privateKeyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  privateKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  privateKeyText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    fontFamily: 'monospace',
  },
  eyeButton: {
    marginLeft: 8,
    padding: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 8,
    textAlign: 'center',
  },
});