import { View, Text, StyleSheet } from 'react-native';
import { CircleCheck as CheckCircle, Clock, Circle as XCircle } from 'lucide-react-native';

interface StatusBadgeProps {
  status: 'completed' | 'pending' | 'failed';
  size?: 'small' | 'medium' | 'large';
}

export default function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: '#10b981',
          backgroundColor: '#d1fae5',
          text: 'Completed',
        };
      case 'pending':
        return {
          icon: Clock,
          color: '#f59e0b',
          backgroundColor: '#fef3c7',
          text: 'Pending',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: '#ef4444',
          backgroundColor: '#fee2e2',
          text: 'Failed',
        };
      default:
        return {
          icon: Clock,
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          text: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  const sizeStyles = {
    small: { padding: 4, iconSize: 12, fontSize: 10 },
    medium: { padding: 8, iconSize: 16, fontSize: 12 },
    large: { padding: 12, iconSize: 20, fontSize: 14 },
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: config.backgroundColor, padding: sizeStyles[size].padding }
    ]}>
      <Icon size={sizeStyles[size].iconSize} color={config.color} />
      <Text style={[
        styles.text,
        { color: config.color, fontSize: sizeStyles[size].fontSize }
      ]}>
        {config.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    marginLeft: 4,
  },
});