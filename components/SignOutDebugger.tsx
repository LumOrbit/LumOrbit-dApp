import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function SignOutDebugger() {
  const { signOut, user } = useAuth();
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp}: ${message}`;
    console.log(logEntry);
    setLog(prev => [...prev, logEntry]);
  };

  const clearLog = () => {
    setLog([]);
  };

  const testDirectSignOut = async () => {
    addLog('🔴 Starting direct Supabase signOut test');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        addLog(`❌ Direct signOut error: ${error.message}`);
      } else {
        addLog('✅ Direct signOut successful');
      }
    } catch (error) {
      addLog(`💥 Direct signOut exception: ${error}`);
    }
  };

  const testAuthHookSignOut = async () => {
    addLog('🔴 Starting auth hook signOut test');
    try {
      const result = await signOut();
      if (result?.error) {
        addLog(`❌ Auth hook signOut error: ${result.error.message}`);
      } else {
        addLog('✅ Auth hook signOut successful');
      }
    } catch (error) {
      addLog(`💥 Auth hook signOut exception: ${error}`);
    }
  };

  const checkCurrentSession = async () => {
    addLog('🔍 Checking current session');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        addLog(`❌ Session check error: ${error.message}`);
      } else if (session) {
        addLog(`✅ Active session found: ${session.user.id}`);
      } else {
        addLog('ℹ️ No active session');
      }
    } catch (error) {
      addLog(`💥 Session check exception: ${error}`);
    }
  };

  const checkAsyncStorage = async () => {
    addLog('🔍 Checking AsyncStorage');
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Test basic AsyncStorage functionality
      const testKey = 'test_key_' + Date.now();
      const testValue = 'test_value';
      
      await AsyncStorage.setItem(testKey, testValue);
      addLog('✅ AsyncStorage setItem successful');
      
      const retrievedValue = await AsyncStorage.getItem(testKey);
      if (retrievedValue === testValue) {
        addLog('✅ AsyncStorage getItem successful');
      } else {
        addLog(`❌ AsyncStorage getItem failed: expected ${testValue}, got ${retrievedValue}`);
      }
      
      await AsyncStorage.removeItem(testKey);
      addLog('✅ AsyncStorage removeItem successful');
      
      // Check if there are any wallet-related items
      if (user) {
        const walletKey = `stellar_wallet_${user.id}`;
        const walletData = await AsyncStorage.getItem(walletKey);
        if (walletData) {
          addLog(`✅ Found wallet data for user ${user.id}`);
        } else {
          addLog(`ℹ️ No wallet data found for user ${user.id}`);
        }
      }
    } catch (error) {
      addLog(`💥 AsyncStorage test exception: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SignOut Debugger</Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={checkCurrentSession}>
          <Text style={styles.buttonText}>Check Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={checkAsyncStorage}>
          <Text style={styles.buttonText}>Test AsyncStorage</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={testDirectSignOut}>
          <Text style={styles.buttonText}>Direct SignOut</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testAuthHookSignOut}>
          <Text style={styles.buttonText}>Hook SignOut</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.clearButton} onPress={clearLog}>
        <Text style={styles.buttonText}>Clear Log</Text>
      </TouchableOpacity>
      
      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Debug Log:</Text>
        {log.map((entry, index) => (
          <Text key={index} style={styles.logEntry}>{entry}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logContainer: {
    maxHeight: 200,
    backgroundColor: '#000',
    padding: 8,
    borderRadius: 4,
  },
  logTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logEntry: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
}); 