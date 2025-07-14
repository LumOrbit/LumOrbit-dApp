import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ExternalLink,
  Copy,
  CheckCircle,
  Wallet,
  Activity,
  Zap,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { getAccountBalance } from '@/lib/stellar';

interface StellarAccountDetailsProps {
  publicKey: string;
  onRefresh?: () => void;
}

export default function StellarAccountDetails({ publicKey, onRefresh }: StellarAccountDetailsProps) {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [showFullKey, setShowFullKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    fetchBalance();
  }, [publicKey]);

  useEffect(() => {
    // Pulse animation for balance
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const accountBalance = await getAccountBalance(publicKey);
      setBalance(accountBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('Error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(publicKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const openStellarExpert = () => {
    const url = `https://stellar.expert/explorer/testnet/account/${publicKey}`;
    Linking.openURL(url);
  };

  const openTransactionHistory = () => {
    const url = `https://stellar.expert/explorer/testnet/account/${publicKey}/history`;
    Linking.openURL(url);
  };

  const formatPublicKey = (key: string) => {
    if (showFullKey) return key;
    return `${key.slice(0, 6)}...${key.slice(-6)}`;
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Star size={32} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>Stellar Account</Text>
            <Text style={styles.headerSubtitle}>Live on Testnet</Text>
          </View>
        </LinearGradient>

        {/* Balance Card */}
        <Animated.View
          style={[
            styles.balanceCard,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#ffecd2', '#fcb69f']}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceContent}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceAmount}>
                  {loading ? '...' : balance}
                </Text>
                <Text style={styles.balanceCurrency}>XLM</Text>
              </View>
              <TouchableOpacity style={styles.refreshButton} onPress={fetchBalance}>
                <Activity size={16} color="#8b5cf6" />
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Account Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          
          {/* Public Key */}
          <View style={styles.detailRow}>
            <View style={styles.detailHeader}>
              <Wallet size={20} color="#6366f1" />
              <Text style={styles.detailLabel}>Public Key</Text>
            </View>
            <View style={styles.keyContainer}>
              <TouchableOpacity 
                style={styles.keyRow}
                onPress={() => setShowFullKey(!showFullKey)}
              >
                <Text style={styles.keyText}>{formatPublicKey(publicKey)}</Text>
                {showFullKey ? (
                  <EyeOff size={16} color="#6b7280" />
                ) : (
                  <Eye size={16} color="#6b7280" />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                {copiedKey ? (
                  <CheckCircle size={16} color="#10b981" />
                ) : (
                  <Copy size={16} color="#6b7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Network Info */}
          <View style={styles.detailRow}>
            <View style={styles.detailHeader}>
              <Zap size={20} color="#10b981" />
              <Text style={styles.detailLabel}>Network</Text>
            </View>
            <View style={styles.networkBadge}>
              <View style={styles.networkDot} />
              <Text style={styles.networkText}>Stellar Testnet</Text>
            </View>
          </View>
        </View>

        {/* Blockchain Explorer Section */}
        <View style={styles.explorerCard}>
          <Text style={styles.sectionTitle}>Blockchain Verification</Text>
          <Text style={styles.explorerDescription}>
            Verify your account and transactions on the Stellar blockchain explorer
          </Text>

          <TouchableOpacity style={styles.explorerButton} onPress={openStellarExpert}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.explorerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ExternalLink size={20} color="#ffffff" />
              <Text style={styles.explorerButtonText}>View on Stellar Expert</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.historyButton} onPress={openTransactionHistory}>
            <View style={styles.historyContent}>
              <Activity size={20} color="#6366f1" />
              <Text style={styles.historyButtonText}>Transaction History</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Features Info */}
        <View style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>Account Features</Text>
          
          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#10b981" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Auto-Created & Funded</Text>
              <Text style={styles.featureDescription}>
                Account automatically created and funded on registration
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#10b981" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>SDK Signed Transactions</Text>
              <Text style={styles.featureDescription}>
                All payments signed securely using Stellar SDK
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#10b981" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Real Blockchain Operations</Text>
              <Text style={styles.featureDescription}>
                Native XLM transfers on Stellar network
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    borderRadius: 20,
    margin: 16,
    overflow: 'hidden',
  },
  headerContent: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceContent: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginRight: 8,
  },
  balanceCurrency: {
    fontSize: 18,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  refreshText: {
    color: '#8b5cf6',
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  keyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  keyText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  networkText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 14,
  },
  explorerCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  explorerDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  explorerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  explorerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  explorerButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  historyButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  historyButtonText: {
    color: '#6366f1',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  featuresCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
}); 