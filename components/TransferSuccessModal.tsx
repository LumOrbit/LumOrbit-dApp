import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { CheckCircle, ArrowRight, Clock, Copy } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

interface TransferSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  transferData: {
    amount: string;
    recipientName: string;
    country: string;
    trackingNumber: string;
    localAmount: string;
    currency: string;
    stellarTxId?: string;
  };
}

export default function TransferSuccessModal({ visible, onClose, transferData }: TransferSuccessModalProps) {
  const handleCopyTracking = async () => {
    await Clipboard.setStringAsync(transferData.trackingNumber);
  };

  const handleCopyTxId = async () => {
    if (transferData.stellarTxId) {
      await Clipboard.setStringAsync(transferData.stellarTxId);
    }
  };

  const handleViewHistory = () => {
    onClose();
    router.push('/(tabs)/history');
  };

  const handleSendAnother = () => {
    onClose();
    // Stay on the same screen but reset form would be handled by parent
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <CheckCircle size={64} color="#10b981" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Transfer Completed!</Text>
          <Text style={styles.subtitle}>
            Your money is on its way to {transferData.recipientName}
          </Text>

          {/* Transfer Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Sent</Text>
              <Text style={styles.detailValue}>${transferData.amount}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Recipient Gets</Text>
              <Text style={styles.detailValue}>
                {transferData.localAmount} {transferData.currency}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Destination</Text>
              <Text style={styles.detailValue}>{transferData.country}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tracking Number</Text>
              <TouchableOpacity 
                style={styles.copyableValue}
                onPress={handleCopyTracking}
              >
                <Text style={styles.trackingNumber}>{transferData.trackingNumber}</Text>
                <Copy size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {transferData.stellarTxId && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Stellar Transaction</Text>
                <TouchableOpacity 
                  style={styles.copyableValue}
                  onPress={handleCopyTxId}
                >
                  <Text style={styles.txId}>
                    {transferData.stellarTxId.substring(0, 8)}...
                  </Text>
                  <Copy size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Clock size={20} color="#f59e0b" />
            <Text style={styles.infoText}>
              Your recipient will be notified and can track the transfer using the tracking number.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleViewHistory}>
              <Text style={styles.secondaryButtonText}>View History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleSendAnother}>
              <Text style={styles.primaryButtonText}>Send Another</Text>
              <ArrowRight size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'right',
  },
  copyableValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  txId: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563eb',
    fontFamily: 'monospace',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#92400e',
    flex: 1,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    color: '#6b7280',
    fontSize: 14,
  },
});