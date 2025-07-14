import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecipientsList from '@/components/RecipientsList';

export default function RecipientsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <RecipientsList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
}); 