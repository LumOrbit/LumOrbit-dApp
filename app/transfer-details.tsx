import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Phone, Mail, MapPin, Calendar, CreditCard, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react-native';
import { useTransfers } from '@/hooks/useTransfers';
import { Database } from '@/lib/database.types';
import * as Clipboard from 'expo-clipboard';

type Transfer = Database['public']['Tables']['transfers']['Row'] & {
  recipient: Database['public']['Tables']['recipients']['Row'];
};

export default function TransferDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { transfers, updateTransferStatus, cancelTransfer } = useTransfers();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const foundTransfer = transfers.find(t => t.id === id);
    setTransfer(foundTransfer || null);
  }, [id, transfers]);

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const handleCancelTransfer = async () => {
    if (!transfer) return;

    Alert.alert(
      'Cancel Transfer',
      'Are you sure you want to cancel this transfer? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            const result = await cancelTransfer(transfer.id);
            if (result.error) {
              Alert.alert('Error', 'Failed to cancel transfer. Please try again.');
            } else {
              Alert.alert('Transfer Cancelled', 'Your transfer has been cancelled successfully.');
            }
            setIsLoading(false);
          }
        }
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={24} color="#10b981" />;
      case 'pending':
        return <Clock size={24} color="#f59e0b" />;
      case 'failed':
        return <XCircle size={24} color="#ef4444" />;
      case 'cancelled':
        return <XCircle size={24} color="#6b7280" />;
      default:
        return <AlertTriangle size={24} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCountryFlag = (country: string) => {
    const flagMap: { [key: string]: string } = {
      'Mexico': '🇲🇽',
      'Philippines': '🇵🇭',
      'Guatemala': '🇬🇹',
      'India': '🇮🇳',
      'Nigeria': '🇳🇬',
      'Kenya': '🇰🇪',
      'Uganda': '🇺🇬',
      'Ghana': '🇬🇭',
    };
    return flagMap[country] || '🌍';
  };

  if (!transfer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Transfer Details</Text>
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Transfer not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Transfer Details</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {getStatusIcon(transfer.status)}
            <Text style={[styles.statusText, { color: getStatusColor(transfer.status) }]}>
              {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.statusDescription}>
            {transfer.status === 'completed' && 'Your transfer has been completed successfully'}
            {transfer.status === 'pending' && 'Your transfer is being processed'}
            {transfer.status === 'failed' && 'Your transfer could not be completed'}
            {transfer.status === 'cancelled' && 'This transfer has been cancelled'}
          </Text>
        </View>

        {/* Amount Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount Sent</Text>
            <Text style={styles.amountValue}>${transfer.amount_usd.toFixed(2)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Transfer Fee</Text>
            <Text style={styles.amountValue}>${transfer.fee_usd.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.amountRow}>
            <Text style={styles.totalLabel}>Total Charged</Text>
            <Text style={styles.totalValue}>${transfer.total_usd.toFixed(2)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.receivedLabel}>Recipient Receives</Text>
            <Text style={styles.receivedValue}>
              {transfer.amount_local.toFixed(2)} {transfer.to_currency}
            </Text>
          </View>
        </View>

        {/* Recipient Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Recipient Information</Text>
          <View style={styles.recipientCard}>
            <View style={styles.recipientHeader}>
              <Text style={styles.countryFlag}>{getCountryFlag(transfer.recipient.country)}</Text>
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{transfer.recipient.full_name}</Text>
                <Text style={styles.recipientCountry}>{transfer.recipient.country}</Text>
              </View>
            </View>
            
            {transfer.recipient.phone && (
              <View style={styles.contactRow}>
                <Phone size={16} color="#6b7280" />
                <Text style={styles.contactText}>{transfer.recipient.phone}</Text>
              </View>
            )}
            
            {transfer.recipient.email && (
              <View style={styles.contactRow}>
                <Mail size={16} color="#6b7280" />
                <Text style={styles.contactText}>{transfer.recipient.email}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Transfer Details */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Transfer Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tracking Number</Text>
              <TouchableOpacity 
                style={styles.copyRow}
                onPress={() => copyToClipboard(transfer.tracking_number, 'Tracking number')}
              >
                <Text style={styles.detailValue}>{transfer.tracking_number}</Text>
                <Copy size={16} color="#2563eb" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Method</Text>
              <Text style={styles.detailValue}>{transfer.delivery_method}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Exchange Rate</Text>
              <Text style={styles.detailValue}>
                1 {transfer.from_currency} = {transfer.exchange_rate.toFixed(4)} {transfer.to_currency}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>{formatDate(transfer.created_at)}</Text>
            </View>
            
            {transfer.estimated_delivery && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Estimated Delivery</Text>
                <Text style={styles.detailValue}>{formatDate(transfer.estimated_delivery)}</Text>
              </View>
            )}
            
            {transfer.completed_at && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Completed</Text>
                <Text style={styles.detailValue}>{formatDate(transfer.completed_at)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        {transfer.status === 'pending' && (
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={[styles.cancelButton, isLoading && styles.disabledButton]}
              onPress={handleCancelTransfer}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>
                {isLoading ? 'Cancelling...' : 'Cancel Transfer'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: '#6b7280',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statusDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  receivedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  receivedValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  recipientCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  recipientCountry: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'right',
    flex: 1,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
}); 