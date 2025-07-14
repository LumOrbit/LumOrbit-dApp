import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { CircleCheck as CheckCircle, Clock, Circle as XCircle, Filter, Search, RefreshCw } from 'lucide-react-native';
import { useTransfers } from '@/hooks/useTransfers';
import { router } from 'expo-router';

export default function HistoryScreen() {
  const { transfers, loading, refetch } = useTransfers();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'failed', label: 'Failed' },
  ];

  const filteredTransfers = transfers.filter(transfer => {
    if (selectedFilter === 'all') return true;
    return transfer.status === selectedFilter;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing transfers:', error);
    } finally {
      setRefreshing(false);
    }
  };

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
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCountryFlag = (country: string) => {
    // Simple mapping for common countries
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading transfers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSent = transfers
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount_usd, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
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
                  <Text style={styles.transferFlag}>{getCountryFlag(transfer.recipient.country)}</Text>
                  <View style={styles.transferDetails}>
                    <Text style={styles.recipientName}>{transfer.recipient.full_name}</Text>
                    <Text style={styles.transferLocation}>{transfer.recipient.country}</Text>
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
                  <Text style={styles.amountText}>-${transfer.amount_usd.toFixed(2)}</Text>
                  <Text style={styles.feeText}>Fee: ${transfer.fee_usd.toFixed(2)}</Text>
                </View>
                <View style={styles.transferDate}>
                  <Text style={styles.dateText}>{formatDate(transfer.created_at)}</Text>
                  <Text style={styles.timeText}>{formatTime(transfer.created_at)}</Text>
                </View>
              </View>

              <View style={styles.transferFooter}>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodText}>{transfer.delivery_method}</Text>
                  <Text style={styles.trackingText}>#{transfer.tracking_number}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => router.push(`/transfer-details?id=${transfer.id}`)}
                >
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
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={16} color="#2563eb" />
              <Text style={styles.refreshButtonText}>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search and Support */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Search size={20} color="#2563eb" />
            <Text style={styles.actionButtonText}>Search Transfers</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} color="#2563eb" />
            <Text style={styles.actionButtonText}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 20,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 8,
  },
});