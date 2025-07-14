import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SettingsLayout() {
  return (
    <>
      <Stack 
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#1f2937',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 4, padding: 8 }}
            >
              <ArrowLeft size={24} color="#1f2937" />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
          headerBackVisible: false,
        }}
      >
        <Stack.Screen 
          name="personal-info" 
          options={{ title: 'Personal Information' }} 
        />
        <Stack.Screen 
          name="verification" 
          options={{ title: 'Identity Verification' }} 
        />
        <Stack.Screen 
          name="payment-methods" 
          options={{ title: 'Payment Methods' }} 
        />
        <Stack.Screen 
          name="documents" 
          options={{ title: 'Documents' }} 
        />
        <Stack.Screen 
          name="pin-settings" 
          options={{ title: 'PIN Settings' }} 
        />
        <Stack.Screen 
          name="two-factor-auth" 
          options={{ title: 'Two-Factor Authentication' }} 
        />
        <Stack.Screen 
          name="notifications" 
          options={{ title: 'Notification Settings' }} 
        />
        <Stack.Screen 
          name="language" 
          options={{ title: 'Language Settings' }} 
        />
        <Stack.Screen 
          name="help" 
          options={{ title: 'Help Center' }} 
        />
        <Stack.Screen 
          name="support" 
          options={{ title: 'Contact Support' }} 
        />
        <Stack.Screen 
          name="terms" 
          options={{ title: 'Terms & Privacy' }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
} 