import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { Clock, Zap, CheckCircle, Send, AlertTriangle } from 'lucide-react-native';

interface TransferProgressModalProps {
  visible: boolean;
  progress: number;
  status: 'pending' | 'processing' | 'sending' | 'completing' | 'completed' | 'failed';
  message: string;
  recipientName: string;
  amount: string;
}

export default function TransferProgressModal({
  visible,
  progress,
  status,
  message,
  recipientName,
  amount
}: TransferProgressModalProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    // Pulse animation for active status
    if (status !== 'completed' && status !== 'failed') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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
      pulse.start();

      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'processing':
        return Clock;
      case 'sending':
        return Send;
      case 'completing':
        return Zap;
      case 'completed':
        return CheckCircle;
      case 'failed':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'sending':
        return '#3b82f6';
      case 'completing':
        return '#8b5cf6';
      default:
        return '#f59e0b';
    }
  };

  const StatusIcon = getStatusIcon();
  const statusColor = getStatusColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Status Icon */}
          <Animated.View 
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <StatusIcon size={48} color={statusColor} />
          </Animated.View>

          {/* Transfer Info */}
          <Text style={styles.title}>Sending to {recipientName}</Text>
          <Text style={styles.amount}>${amount}</Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: statusColor,
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>

          {/* Status Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Status Steps */}
          <View style={styles.stepsContainer}>
            {[
              { key: 'processing', label: 'Processing', threshold: 20 },
              { key: 'sending', label: 'Sending', threshold: 50 },
              { key: 'completing', label: 'Completing', threshold: 80 },
              { key: 'completed', label: 'Completed', threshold: 100 },
            ].map((step, index) => (
              <View key={step.key} style={styles.step}>
                <View 
                  style={[
                    styles.stepCircle,
                    { 
                      backgroundColor: progress >= step.threshold ? statusColor : '#e5e7eb',
                    }
                  ]}
                />
                <Text 
                  style={[
                    styles.stepLabel,
                    { color: progress >= step.threshold ? statusColor : '#9ca3af' }
                  ]}
                >
                  {step.label}
                </Text>
                {index < 3 && (
                  <View 
                    style={[
                      styles.stepLine,
                      { backgroundColor: progress > step.threshold ? statusColor : '#e5e7eb' }
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Text style={styles.securityText}>
              🔒 Your transfer is secured by Stellar blockchain technology
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  message: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  step: {
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    minWidth: 60,
  },
  stepLine: {
    position: 'absolute',
    top: 6,
    left: 12,
    width: 30,
    height: 2,
    zIndex: -1,
  },
  securityNotice: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    width: '100%',
  },
  securityText: {
    fontSize: 12,
    color: '#1e40af',
    textAlign: 'center',
  },
});