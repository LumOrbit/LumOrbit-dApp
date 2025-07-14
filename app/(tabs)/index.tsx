import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, DollarSign, Send, Clock } from 'lucide-react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  
  const exchangeRates = [
    { from: 'USD', to: 'MXN', rate: '18.45', change: '+0.25' },
    { from: 'USD', to: 'PHP', rate: '56.20', change: '-0.15' },
    { from: 'USD', to: 'INR', rate: '83.12', change: '+0.42' },
    { from: 'USD', to: 'GTQ', rate: '7.85', change: '+0.05' },
  ];

  const quickActions = [
    { icon: Send, label: 'Send Money', color: '#2563eb', action: 'send' },
    { icon: Clock, label: 'Recent', color: '#10b981', action: 'recent' },
    { icon: TrendingUp, label: 'Rates', color: '#f59e0b', action: 'rates' },
    { icon: DollarSign, label: 'Add Funds', color: '#8b5cf6', action: 'add-funds' },
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'send':
        router.push('/(tabs)/send');
        break;
      case 'recent':
        router.push('/(tabs)/history');
        break;
      case 'rates':
        // Scroll to the Exchange Rates section
        scrollViewRef.current?.scrollTo({ y: 400, animated: true });
        break;
      case 'add-funds':
        router.push('/settings/payment-methods');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subtitle}>Send money safely worldwide</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>$1,247.50</Text>
          <View style={styles.balanceFooter}>
            <Text style={styles.stellar}>🌟 Stellar Network</Text>
            <TouchableOpacity 
              style={styles.addFundsButton}
              onPress={() => router.push('/settings/payment-methods')}
            >
              <Text style={styles.addFundsText}>+ Add Funds</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.actionCard}
                  onPress={() => handleQuickAction(action.action)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                    <Icon size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Exchange Rates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Exchange Rates</Text>
          <View style={styles.ratesContainer}>
            {exchangeRates.map((rate, index) => (
              <View key={index} style={styles.rateCard}>
                <View style={styles.rateHeader}>
                  <Text style={styles.ratePair}>{rate.from} → {rate.to}</Text>
                  <Text style={[
                    styles.rateChange,
                    { color: rate.change.startsWith('+') ? '#10b981' : '#ef4444' }
                  ]}>
                    {rate.change}
                  </Text>
                </View>
                <Text style={styles.rateValue}>{rate.rate}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Send size={20} color="#2563eb" />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>Sent to Maria Rodriguez</Text>
                <Text style={styles.activitySubtitle}>Yesterday • Mexico</Text>
              </View>
              <Text style={styles.activityAmount}>-$250.00</Text>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <DollarSign size={20} color="#10b981" />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>Funds Added</Text>
                <Text style={styles.activitySubtitle}>3 days ago</Text>
              </View>
              <Text style={[styles.activityAmount, { color: '#10b981' }]}>+$500.00</Text>
            </View>
          </View>
        </View>
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
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  balanceCard: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#bfdbfe',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stellar: {
    fontSize: 14,
    color: '#bfdbfe',
  },
  addFundsButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addFundsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  ratesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rateCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratePair: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  rateChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  rateValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
});