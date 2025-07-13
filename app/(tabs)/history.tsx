import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { CircleCheck as CheckCircle, Clock, Circle as XCircle, Filter, Search } from 'lucide-react-native';

export default function HistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const transfers = [
    {
      id: 'T001',
      recipient: 'Maria Rodriguez',
      country: 'Mexico',
      flag: '🇲🇽',
      amount: 250.00,
      fee: 2.99,
      status: 'completed',
      date: '2024-01-15',
      time: '2:30 PM',
      method: 'Bank Transfer',
      trackingNumber: 'ST7834920485',
    },
    {
      id: 'T002',
      recipient: 'José García',
      country: 'Mexico',
      flag: '🇲🇽',
      amount: 150.00,
      fee: 2.99,
      status: 'pending',
      date: '2024-01-16',
      time: '10:15 AM',
      method: 'Cash Pickup',
      trackingNumber: 'ST7834920486',
    },
    {
      id: 'T003',
      recipient: 'Ana Santos',
      country: 'Philippines',
      flag: '🇵🇭',
      amount: 300.00,
      fee: 3.99,
      status: 'failed',
      date: '2024-01-14',
      time: '4:45 PM',
      method: 'Mobile Wallet',
      trackingNumber: 'ST7834920484',
    },
    {
      id: 'T004',
      recipient: 'Carlos Mendez',
      country: 'Guatemala',
      flag: '🇬🇹',
      amount: 200.00,
      fee: 2.99,
      status: 'completed',
      date: '2024-01-13',
      time: '11:20 AM',
      method: 'Bank Transfer',
      trackingNumber: 'ST7834920483',
    },
    {
      id: 'T005',
      recipient: 'Rosa Martinez',
      country: 'Mexico',
      flag: '🇲🇽',
      amount: 180.00,
      fee: 2.99,
      status: 'completed',
      date: '2024-01-12',
      time: '3:10 PM',
      method: 'Cash Pickup',
      trackingNumber: 'ST7834920482',
    },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'failed', label: 'Failed' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#10b981" />;
      case 'pending':
        return <Clock size={20} color="#f59e0b" />;
      case 'failed':
        return <XCircle size={20} color="#ef4444" />;
      default:
        return <Clock size={20} color="#6b7280" />;
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
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'In Progress';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const filteredTransfers = selectedFilter === 'all' 
    ? transfers 
    : transfers.filter(transfer => transfer.status === selectedFilter);

  const totalSent = transfers
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Transfer History</Text>
          <Text style={styles.subtitle}>Track all your money transfers</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Sent</Text>
            <Text style={styles.summaryValue}>${totalSent.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryValue}>{transfers.length} transfers</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filters}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.id && styles.activeFilterButton
                  ]}
                  onPress={() => setSelectedFilter(filter.id)}
                >
                  <Text style={[
                    styles.filterText,
                    selectedFilter === filter.id && styles.activeFilterText
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Transfers List */}
        <View style={styles.transfersList}>
          {filteredTransfers.map((transfer) => (
            <TouchableOpacity key={transfer.id} style={styles.transferCard}>
              <View style={styles.transferHeader}>
                <View style={styles.transferBasicInfo}>
                  <Text style={styles.transferFlag}>{transfer.flag}</Text>
                  <View style={styles.transferDetails}>
                    <Text style={styles.recipientName}>{transfer.recipient}</Text>
                    <Text style={styles.transferLocation}>{transfer.country}</Text>
                  </View>
                </View>
                <View style={styles.transferStatus}>
                  {getStatusIcon(transfer.status)}
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(transfer.status) }
                  ]}>
                    {getStatusText(transfer.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.transferMeta}>
                <View style={styles.transferAmount}>
                  <Text style={styles.amountText}>-${transfer.amount.toFixed(2)}</Text>
                  <Text style={styles.feeText}>Fee: ${transfer.fee}</Text>
                </View>
                <View style={styles.transferDate}>
                  <Text style={styles.dateText}>{transfer.date}</Text>
                  <Text style={styles.timeText}>{transfer.time}</Text>
                </View>
              </View>

              <View style={styles.transferFooter}>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodText}>{transfer.method}</Text>
                  <Text style={styles.trackingText}>#{transfer.trackingNumber}</Text>
                </View>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredTransfers.length === 0 && (
          <View style={styles.emptyState}>
            <Clock size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No transfers found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'all' 
                ? 'You haven\'t made any transfers yet' 
                : `No ${selectedFilter} transfers found`}
            </Text>
          </View>
        )}

        {/* Search and Support */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Search size={20} color="#2563eb" />
            <Text style={styles.actionButtonText}>Search Transfers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Filter size={20} color="#2563eb" />
            <Text style={styles.actionButtonText}>Advanced Filters</Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  transfersList: {
    marginBottom: 32,
  },
  transferCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  transferBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transferFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  transferDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  transferLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  transferStatus: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  transferMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transferAmount: {
    alignItems: 'flex-start',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  feeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  transferDate: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  transferFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  methodInfo: {
    flex: 1,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  trackingText: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewButton: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 8,
  },
});