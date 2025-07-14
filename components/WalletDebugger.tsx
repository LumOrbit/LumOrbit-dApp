import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { generateStellarWallet, encryptPrivateKey, decryptPrivateKey } from '@/lib/stellar';

const WalletDebugger = () => {
  const [log, setLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { createInvisibleWallet } = useStellarWallet();

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const clearLog = () => {
    setLog([]);
  };

  const testStellarWalletGeneration = async () => {
    try {
      addLog('Testing Stellar wallet generation...');
      const wallet = generateStellarWallet();
      addLog(`✅ Wallet generated successfully: ${wallet.publicKey}`);
      addLog(`✅ Has secret key: ${!!wallet.secretKey}`);
      return wallet;
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Wallet generation failed: ${err.message}`);
      throw error;
    }
  };

  const testEncryption = async () => {
    try {
      addLog('Testing encryption/decryption...');
      const wallet = await testStellarWalletGeneration();
      const password = 'test-password-123';
      
      const encrypted = encryptPrivateKey(wallet.secretKey, password);
      addLog(`✅ Encryption successful, encrypted length: ${encrypted.length}`);
      
      const decrypted = decryptPrivateKey(encrypted, password);
      addLog(`✅ Decryption successful: ${decrypted === wallet.secretKey ? 'MATCH' : 'MISMATCH'}`);
      
      return { wallet, encrypted };
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Encryption test failed: ${err.message}`);
      throw error;
    }
  };

  const testWalletCreation = async () => {
    try {
      setIsLoading(true);
      addLog('Testing full wallet creation process...');
      
      const testUserId = 'test-user-123';
      const testEmail = 'test@example.com';
      
      const walletData = await createInvisibleWallet(testUserId, testEmail);
      
      if (walletData) {
        addLog(`✅ Wallet creation successful:`);
        addLog(`  - Public Key: ${walletData.publicKey}`);
        addLog(`  - Wallet Address: ${walletData.walletAddress}`);
        addLog(`  - Has Encrypted Key: ${!!walletData.encryptedPrivateKey}`);
        addLog(`  - Encrypted Key Length: ${walletData.encryptedPrivateKey.length}`);
      } else {
        addLog(`❌ Wallet creation returned null`);
      }
      
      return walletData;
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Wallet creation failed: ${err.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const runFullTest = async () => {
    clearLog();
    try {
      addLog('🚀 Starting full wallet creation test...');
      
      await testStellarWalletGeneration();
      await testEncryption();
      await testWalletCreation();
      
      addLog('🎉 All tests passed!');
    } catch (error) {
      const err = error as Error;
      addLog(`💥 Test failed: ${err.message}`);
      Alert.alert('Test Failed', err.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Wallet Creation Debugger
      </Text>
      
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <TouchableOpacity
          onPress={runFullTest}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#ccc' : '#007AFF',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
          }}
        >
          <Text style={{ color: 'white' }}>
            {isLoading ? 'Testing...' : 'Run Full Test'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={clearLog}
          style={{
            backgroundColor: '#FF3B30',
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: 'white' }}>Clear Log</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 10 }}>
        {log.map((entry, index) => (
          <Text key={index} style={{ fontSize: 12, marginBottom: 5 }}>
            {entry}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

export default WalletDebugger; 