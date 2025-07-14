import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ExternalLink,
  Copy,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Hash,
  DollarSign,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

interface TransactionDetailsProps {
  transactionHash: string;
  amount: string;
  type: 'sent' | 'received';
  date: string;
  memo?: string;
  stellarTxId?: string;
}

export default function TransactionDetails({
  transactionHash,
  amount,
  type,
  date,
  memo,
  stellarTxId,
}: TransactionDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const copyTransactionHash = async () => {
    const hashToCopy = stellarTxId || transactionHash;
    await Clipboard.setStringAsync(hashToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openTransactionInExplorer = () => {
    const hashToView = stellarTxId || transactionHash;
    const url = `https://stellar.expert/explorer/testnet/tx/${hashToView}`;
    Linking.openURL(url);
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <LinearGradient
        colors={
          type === 'sent' 
            ? ['#fee2e2', '#fecaca'] 
            : ['#dcfce7', '#bbf7d0']
        }
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: type === 'sent' ? '#ef4444' : '#10b981' }
          ]}>
            {type === 'sent' ? (
              <ArrowUpRight size={24} color="#ffffff" />
            ) : (
              <ArrowDownLeft size={24} color="#ffffff" />
            )}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.transactionType}>
              {type === 'sent' ? 'Payment Sent' : 'Payment Received'}
            </Text>
            <View style={styles.amountRow}>
              <Text style={[
                styles.amount,
                { color: type === 'sent' ? '#dc2626' : '#059669' }
              ]}>
                {type === 'sent' ? '-' : '+'}{amount}
              </Text>
              <Text style={styles.currency}>XLM</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Transaction Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Transaction Details</Text>

        {/* Date */}
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Calendar size={18} color="#6366f1" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>{formatDate(date)}</Text>
          </View>
        </View>

        {/* Transaction Hash */}
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Hash size={18} color="#6366f1" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Transaction Hash</Text>
            <TouchableOpacity style={styles.hashContainer} onPress={copyTransactionHash}>
              <Text style={styles.hashText}>
                {formatHash(stellarTxId || transactionHash)}
              </Text>
              {copied ? (
                <CheckCircle size={16} color="#10b981" />
              ) : (
                <Copy size={16} color="#6b7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <DollarSign size={18} color="#6366f1" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>{amount} XLM</Text>
          </View>
        </View>

        {/* Memo */}
        {memo && (
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.memoIcon}>📝</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Memo</Text>
              <Text style={styles.detailValue}>{memo}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Blockchain Verification */}
      <View style={styles.verificationSection}>
        <Text style={styles.sectionTitle}>Blockchain Verification</Text>
        <Text style={styles.verificationDescription}>
          This transaction is permanently recorded on the Stellar blockchain
        </Text>

        <TouchableOpacity 
          style={styles.explorerButton} 
          onPress={openTransactionInExplorer}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.explorerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ExternalLink size={18} color="#ffffff" />
            <Text style={styles.explorerButtonText}>View on Stellar Expert</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* SDK Info */}
        <View style={styles.sdkInfo}>
          <CheckCircle size={16} color="#10b981" />
          <Text style={styles.sdkText}>Signed with Stellar SDK</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 6,
  },
  currency: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  detailsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memoIcon: {
    fontSize: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  hashText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
  },
  verificationSection: {
    padding: 20,
  },
  verificationDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  explorerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  explorerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  explorerButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  sdkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sdkText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
}); 