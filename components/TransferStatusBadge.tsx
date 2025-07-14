import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react-native';

interface TransferStatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export default function TransferStatusBadge({ 
  status, 
  size = 'medium', 
  showIcon = true 
}: TransferStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          backgroundColor: '#dcfce7',
          borderColor: '#16a34a',
          textColor: '#15803d',
          icon: <CheckCircle size={getIconSize()} color="#15803d" />,
          label: 'Completed'
        };
      case 'pending':
        return {
          backgroundColor: '#fef3c7',
          borderColor: '#f59e0b',
          textColor: '#d97706',
          icon: <Clock size={getIconSize()} color="#d97706" />,
          label: 'Pending'
        };
      case 'failed':
        return {
          backgroundColor: '#fee2e2',
          borderColor: '#dc2626',
          textColor: '#dc2626',
          icon: <XCircle size={getIconSize()} color="#dc2626" />,
          label: 'Failed'
        };
      case 'cancelled':
        return {
          backgroundColor: '#f3f4f6',
          borderColor: '#6b7280',
          textColor: '#6b7280',
          icon: <XCircle size={getIconSize()} color="#6b7280" />,
          label: 'Cancelled'
        };
      default:
        return {
          backgroundColor: '#f3f4f6',
          borderColor: '#6b7280',
          textColor: '#6b7280',
          icon: <AlertTriangle size={getIconSize()} color="#6b7280" />,
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 16;
      case 'large':
        return 20;
      default:
        return 16;
    }
  };

  const getTextStyle = () => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'medium':
        return styles.textMedium;
      case 'large':
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };

  const getPaddingStyle = () => {
    switch (size) {
      case 'small':
        return styles.paddingSmall;
      case 'medium':
        return styles.paddingMedium;
      case 'large':
        return styles.paddingLarge;
      default:
        return styles.paddingMedium;
    }
  };

  const config = getStatusConfig(status);

  return (
    <View 
      style={[
        styles.badge,
        getPaddingStyle(),
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        }
      ]}
    >
      {showIcon && config.icon}
      <Text 
        style={[
          getTextStyle(),
          { 
            color: config.textColor,
            marginLeft: showIcon ? 6 : 0
          }
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  paddingSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  paddingMedium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  paddingLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textSmall: {
    fontSize: 12,
    fontWeight: '500',
  },
  textMedium: {
    fontSize: 14,
    fontWeight: '600',
  },
  textLarge: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 