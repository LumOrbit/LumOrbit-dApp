import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const AuthDebugger = () => {
  const [log, setLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { createWalletManually, signUp } = useAuth();

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const clearLog = () => {
    setLog([]);
  };

  const testAuthContext = async () => {
    try {
      addLog('Testing auth context...');
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addLog(`❌ Session error: ${sessionError.message}`);
        return;
      }
      
      if (!session) {
        addLog('❌ No active session');
        return;
      }
      
      addLog(`✅ Session found: ${session.user.id}`);
      addLog(`✅ User email: ${session.user.email}`);
      
      // Check user metadata
      const metadata = session.user.user_metadata;
      if (metadata) {
        addLog(`✅ User metadata found:`);
        addLog(`  - Full name: ${metadata.full_name || 'Not set'}`);
        addLog(`  - Phone: ${metadata.phone || 'Not set'}`);
        addLog(`  - Country: ${metadata.country || 'Not set'}`);
        
        if (metadata.profile_data) {
          addLog(`✅ Profile data in metadata:`);
          addLog(`  - Full name: ${metadata.profile_data.full_name || 'Not set'}`);
          addLog(`  - Phone: ${metadata.profile_data.phone || 'Not set'}`);
          addLog(`  - Country: ${metadata.profile_data.country || 'Not set'}`);
        } else {
          addLog(`❌ No profile_data found in metadata`);
        }
      } else {
        addLog(`❌ No user metadata found`);
      }
      
      // Test auth.uid() function
      const { data: uidData, error: uidError } = await supabase
        .rpc('auth_uid'); // This is a built-in function that returns auth.uid()
      
      if (uidError) {
        addLog(`❌ auth.uid() error: ${uidError.message}`);
      } else {
        addLog(`✅ auth.uid() returns: ${uidData}`);
        addLog(`✅ Session user ID matches: ${uidData === session.user.id}`);
      }
      
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Auth context test failed: ${err.message}`);
    }
  };

  const testDatabaseAccess = async () => {
    try {
      addLog('Testing database access...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        addLog('❌ No active session - cannot test database access');
        return;
      }
      
      // Test reading from users table
      const { data: userData, error: readError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (readError) {
        addLog(`❌ Read error: ${readError.message} (Code: ${readError.code})`);
      } else {
        addLog(`✅ Read successful: ${userData ? 'User found' : 'No user found'}`);
        if (userData) {
          addLog(`  - Email: ${userData.email}`);
          addLog(`  - Full name: ${userData.full_name || 'Not set'}`);
          addLog(`  - Phone: ${userData.phone || 'Not set'}`);
          addLog(`  - Country: ${userData.country || 'Not set'}`);
          addLog(`  - Wallet: ${userData.wallet_address || 'None'}`);
          addLog(`  - Public key: ${userData.public_key || 'None'}`);
          addLog(`  - Private key: ${userData.private_key ? 'Set' : 'Not set'}`);
        }
      }
      
      // Test writing to users table
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (updateError) {
        addLog(`❌ Write error: ${updateError.message} (Code: ${updateError.code})`);
        addLog(`  - Details: ${updateError.details || 'No details'}`);
        addLog(`  - Hint: ${updateError.hint || 'No hint'}`);
      } else {
        addLog(`✅ Write successful: ${updateData ? 'Data saved' : 'No data returned'}`);
        if (updateData && updateData.length > 0) {
          addLog(`  - Saved user: ${updateData[0].email}`);
        }
      }
      
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Database access test failed: ${err.message}`);
    }
  };

  const testFullWalletProcess = async () => {
    try {
      addLog('Testing full wallet creation process...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        addLog('❌ No active session - cannot test wallet creation');
        return;
      }
      
      // Simulate wallet creation
      const testWalletData = {
        wallet_address: 'TEST_WALLET_ADDRESS',
        public_key: 'TEST_PUBLIC_KEY',
        private_key: 'TEST_ENCRYPTED_PRIVATE_KEY'
      };
      
      const { data: walletData, error: walletError } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          wallet_address: testWalletData.wallet_address,
          public_key: testWalletData.public_key,
          private_key: testWalletData.private_key,
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (walletError) {
        addLog(`❌ Wallet upsert error: ${walletError.message}`);
        addLog(`  - Code: ${walletError.code}`);
        addLog(`  - Details: ${walletError.details || 'No details'}`);
      } else {
        addLog(`✅ Wallet upsert successful`);
        if (walletData && walletData.length > 0) {
          const saved = walletData[0];
          addLog(`  - Wallet address: ${saved.wallet_address}`);
          addLog(`  - Public key: ${saved.public_key}`);
          addLog(`  - Private key: ${saved.private_key ? 'Saved' : 'Missing'}`);
        }
      }
      
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Wallet process test failed: ${err.message}`);
    }
  };

  const testManualWalletCreation = async () => {
    try {
      addLog('Testing manual wallet creation...');
      
      const walletData = await createWalletManually();
      
      if (walletData) {
        addLog(`✅ Manual wallet creation successful`);
        addLog(`  - Public Key: ${walletData.publicKey}`);
        addLog(`  - Wallet Address: ${walletData.walletAddress}`);
        Alert.alert('Success', 'Wallet created successfully!');
      } else {
        addLog(`❌ Manual wallet creation failed - no data returned`);
      }
      
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Manual wallet creation failed: ${err.message}`);
      Alert.alert('Error', err.message);
    }
  };

  const testSignupWithProfile = async () => {
    try {
      addLog('Testing signup with profile data...');
      
      // Generate random test data
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'testPassword123';
      const testUserData = {
        full_name: 'Test User',
        phone: '+1234567890',
        country: 'US',
      };
      
      addLog(`Signing up with email: ${testEmail}`);
      addLog(`Profile data: ${JSON.stringify(testUserData)}`);
      
      const { data, error } = await signUp(testEmail, testPassword, testUserData);
      
      if (error) {
        addLog(`❌ Signup error: ${error.message}`);
      } else {
        addLog(`✅ Signup successful`);
        addLog(`  - User ID: ${data.user?.id}`);
        addLog(`  - Email confirmed: ${!!data.session}`);
        if (data.session) {
          addLog(`  - Wallet should be created immediately`);
        } else {
          addLog(`  - Wallet will be created after email confirmation`);
        }
      }
      
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Signup test failed: ${err.message}`);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      addLog('Testing database connection...');
      
      // Test basic connection
      const startTime = Date.now();
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single();
      
      const responseTime = Date.now() - startTime;
      addLog(`Database response time: ${responseTime}ms`);
      
      if (connectionError) {
        if (connectionError.code === 'PGRST116') {
          addLog('✅ Database connection successful (no users in table)');
        } else {
          addLog(`❌ Database connection error: ${connectionError.message}`);
          addLog(`  - Code: ${connectionError.code}`);
          addLog(`  - Details: ${connectionError.details || 'None'}`);
        }
      } else {
        addLog('✅ Database connection successful');
      }
      
      // Test Supabase URL and key
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      addLog(`Supabase URL: ${supabaseUrl ? 'Set' : 'Missing'}`);
      addLog(`Supabase Key: ${supabaseKey ? 'Set' : 'Missing'}`);
      
      if (supabaseUrl) {
        try {
          const urlObj = new URL(supabaseUrl);
          addLog(`✅ Supabase URL is valid: ${urlObj.origin}`);
        } catch (urlError) {
          addLog(`❌ Invalid Supabase URL format`);
        }
      }
      
      // Test network connectivity
      try {
        const networkTest = await fetch(supabaseUrl + '/rest/v1/', {
          method: 'HEAD',
          headers: {
            'apikey': supabaseKey || '',
            'Authorization': `Bearer ${supabaseKey || ''}`,
          }
        });
        
        addLog(`✅ Network connectivity test: ${networkTest.status}`);
      } catch (networkError) {
        const err = networkError as Error;
        addLog(`❌ Network connectivity test failed: ${err.message}`);
      }
      
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Database connection test failed: ${err.message}`);
    }
  };

  const testDirectDatabaseSave = async () => {
    try {
      addLog('Testing direct database save...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        addLog('❌ No active session - cannot test database save');
        return;
      }
      
      // Test data
      const testData = {
        id: session.user.id,
        email: session.user.email,
        full_name: 'Test User Direct',
        phone: '+1234567890',
        country: 'TEST',
        wallet_address: 'TEST_WALLET_ADDRESS',
        public_key: 'TEST_PUBLIC_KEY',
        private_key: 'TEST_PRIVATE_KEY',
        updated_at: new Date().toISOString()
      };
      
      addLog('Testing upsert operation...');
      addLog(`Payload: ${JSON.stringify(testData, null, 2)}`);
      
      const { data: upsertData, error: upsertError } = await supabase
        .from('users')
        .upsert(testData)
        .select();
      
      if (upsertError) {
        addLog(`❌ Direct upsert failed: ${upsertError.message}`);
        addLog(`  - Code: ${upsertError.code}`);
        addLog(`  - Details: ${upsertError.details || 'None'}`);
      } else {
        addLog(`✅ Direct upsert successful`);
        if (upsertData && upsertData.length > 0) {
          const saved = upsertData[0];
          addLog(`  - Saved data: ${JSON.stringify(saved, null, 2)}`);
        }
      }
      
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Direct database save test failed: ${err.message}`);
    }
  };

  const checkExistingUserData = async () => {
    try {
      addLog('Checking existing user data...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        addLog('❌ No active session - cannot check user data');
        return;
      }
      
      // Check what exists in the database for this user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (userError) {
        if (userError.code === 'PGRST116') {
          addLog('ℹ️ No user record found in database');
        } else {
          addLog(`❌ Error checking user data: ${userError.message}`);
          addLog(`  - Code: ${userError.code}`);
        }
      } else {
        addLog('✅ User record found:');
        addLog(`  - ID: ${userData.id}`);
        addLog(`  - Email: ${userData.email}`);
        addLog(`  - Full name: ${userData.full_name || 'Not set'}`);
        addLog(`  - Phone: ${userData.phone || 'Not set'}`);
        addLog(`  - Country: ${userData.country || 'Not set'}`);
        addLog(`  - Wallet address: ${userData.wallet_address || 'Not set'}`);
        addLog(`  - Public key: ${userData.public_key || 'Not set'}`);
        addLog(`  - Private key: ${userData.private_key ? 'Set' : 'Not set'}`);
        addLog(`  - Created: ${userData.created_at}`);
        addLog(`  - Updated: ${userData.updated_at}`);
      }
      
      // Also check auth user metadata
      addLog('Checking auth metadata...');
      if (session.user.user_metadata) {
        addLog(`Auth metadata: ${JSON.stringify(session.user.user_metadata, null, 2)}`);
      } else {
        addLog('No auth metadata found');
      }
      
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Check user data failed: ${err.message}`);
    }
  };

  const testWalletCreationStep = async () => {
    try {
      addLog('Testing wallet creation step by step...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        addLog('❌ No active session - cannot test wallet creation');
        return;
      }
      
      // Step 1: Check if user exists
      addLog('Step 1: Checking existing user record...');
      const { data: existingUser } = await supabase
        .from('users')
        .select('wallet_address, public_key')
        .eq('id', session.user.id)
        .single();
      
      addLog(`Existing user has wallet: ${!!existingUser?.wallet_address}`);
      
      // Step 2: Try to trigger wallet creation manually
      addLog('Step 2: Attempting manual wallet creation...');
      
      try {
        const walletData = await createWalletManually();
        if (walletData) {
          addLog(`✅ Manual wallet creation completed`);
          addLog(`  - Public Key: ${walletData.publicKey}`);
          addLog(`  - Wallet Address: ${walletData.walletAddress}`);
        } else {
          addLog(`❌ Manual wallet creation returned null`);
        }
      } catch (walletError) {
        const err = walletError as Error;
        addLog(`❌ Manual wallet creation failed: ${err.message}`);
        addLog(`Error stack: ${err.stack}`);
      }
      
      // Step 3: Check user record again
      addLog('Step 3: Checking user record after wallet creation...');
      const { data: updatedUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (updatedUser) {
        addLog(`✅ User record updated:`);
        addLog(`  - Wallet address: ${updatedUser.wallet_address || 'Not set'}`);
        addLog(`  - Public key: ${updatedUser.public_key || 'Not set'}`);
        addLog(`  - Private key: ${updatedUser.private_key ? 'Set' : 'Not set'}`);
      } else {
        addLog(`❌ No user record found after wallet creation`);
      }
      
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Wallet creation step test failed: ${err.message}`);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    clearLog();
    
    try {
      await testDatabaseConnection();
      await testAuthContext();
      await testDatabaseAccess();
      await testFullWalletProcess();
      addLog('🎉 All tests completed');
    } catch (error) {
      const err = error as Error;
      addLog(`💥 Test suite failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Auth & Database Debugger
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
        <TouchableOpacity
          onPress={runAllTests}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#ccc' : '#007AFF',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: 'white' }}>
            {isLoading ? 'Testing...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={testManualWalletCreation}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#ccc' : '#34C759',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: 'white' }}>Create Wallet</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={testSignupWithProfile}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#ccc' : '#FF9500',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: 'white' }}>Test Signup</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={testDatabaseConnection}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#ccc' : '#8E44AD',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: 'white' }}>Test Connection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={testDirectDatabaseSave}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#ccc' : '#E67E22',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: 'white' }}>Test DB Save</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={checkExistingUserData}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#ccc' : '#3498DB',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: 'white' }}>Check User Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={testWalletCreationStep}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#ccc' : '#9B59B6',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: 'white' }}>Test Wallet Step</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={clearLog}
          style={{
            backgroundColor: '#FF3B30',
            padding: 10,
            borderRadius: 5,
            marginBottom: 10,
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

export default AuthDebugger; 