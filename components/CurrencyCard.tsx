import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface CurrencyCardProps {
  fromCurrency: string;
  toCurrency: string;
  rate: string;
  change: string;
  flag?: string;
}

export default function CurrencyCard({ 
  fromCurrency, 
  toCurrency, 
  rate, 
  change, 
  flag 
}: CurrencyCardProps) {
  const isPositive = change.startsWith('+');
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.currencyPair}>
          {flag && <Text style={styles.flag}>{flag}</Text>}
          <Text style={styles.pairText}>{fromCurrency} → {toCurrency}</Text>
        </View>
        <View style={[styles.changeContainer, { backgroundColor: isPositive ? '#d1fae5' : '#fee2e2' }]}>
          <Icon size={12} color={isPositive ? '#10b981' : '#ef4444'} />
          <Text style={[styles.changeText, { color: isPositive ? '#10b981' : '#ef4444' }]}>
            {change}
          </Text>
        </View>
      </View>
      <Text style={styles.rate}>{rate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currencyPair: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 16,
    marginRight: 8,
  },
  pairText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  rate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});