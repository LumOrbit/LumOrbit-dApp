import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Plus, Star, Edit3, Trash2, Search, Filter, MoreVertical } from 'lucide-react-native';
import { useRecipients } from '@/hooks/useRecipients';
import { Database } from '@/lib/database.types';
import RecipientForm from './RecipientForm';

type Recipient = Database['public']['Tables']['recipients']['Row'];

interface RecipientsListProps {
  onSelectRecipient?: (recipient: Recipient) => void;
  selectable?: boolean;
  selectedRecipientId?: string;
}

export default function RecipientsList({ 
  onSelectRecipient, 
  selectable = false, 
  selectedRecipientId 
}: RecipientsListProps) {
  const { recipients, loading, deleteRecipient, updateRecipient } = useRecipients();
  const [showForm, setShowForm] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | undefined>();
  const [showActions, setShowActions] = useState<string | null>(null);

  const handleEditRecipient = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setShowForm(true);
    setShowActions(null);
  };

  const handleDeleteRecipient = (recipient: Recipient) => {
    Alert.alert(
      'Delete Recipient',
      `Are you sure you want to delete ${recipient.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteRecipient(recipient.id);
            if (result.error) {
              const errorMessage = result.error instanceof Error ? result.error.message : 'Failed to delete recipient';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
    setShowActions(null);
  };

  const handleToggleFavorite = async (recipient: Recipient) => {
    const result = await updateRecipient(recipient.id, {
      is_favorite: !recipient.is_favorite,
    });
    
    if (result.error) {
      const errorMessage = result.error instanceof Error ? result.error.message : 'Failed to update favorite status';
      Alert.alert('Error', errorMessage);
    }
    setShowActions(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecipient(undefined);
  };

  const getDeliveryMethodDisplayName = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash_pickup':
        return 'Cash Pickup';
      case 'mobile_wallet':
        return 'Mobile Wallet';
      default:
        return method;
    }
  };

  const renderRecipientCard = (recipient: Recipient) => {
    const isSelected = selectable && selectedRecipientId === recipient.id;
    
    return (
      <TouchableOpacity
        key={recipient.id}
        style={[
          styles.recipientCard,
          isSelected && styles.selectedRecipientCard,
          recipient.is_favorite && styles.favoriteRecipientCard
        ]}
        onPress={() => {
          if (selectable && onSelectRecipient) {
            onSelectRecipient(recipient);
          }
        }}
      >
        <View style={styles.recipientHeader}>
          <View style={styles.recipientAvatar}>
            <Text style={styles.recipientInitial}>
              {recipient.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.recipientInfo}>
            <View style={styles.recipientNameContainer}>
              <Text style={styles.recipientName}>{recipient.full_name}</Text>
              {recipient.is_favorite && (
                <Star size={16} color="#fbbf24" fill="#fbbf24" style={styles.favoriteIcon} />
              )}
            </View>
            <Text style={styles.recipientCountry}>{recipient.country}</Text>
            <Text style={styles.deliveryMethod}>
              {getDeliveryMethodDisplayName(recipient.delivery_method)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionsButton}
            onPress={() => setShowActions(showActions === recipient.id ? null : recipient.id)}
          >
            <MoreVertical size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.contactInfo}>
          {recipient.phone && (
            <Text style={styles.contactText}>📞 {recipient.phone}</Text>
          )}
          {recipient.email && (
            <Text style={styles.contactText}>✉️ {recipient.email}</Text>
          )}
        </View>

        {/* Action Menu */}
        {showActions === recipient.id && (
          <View style={styles.actionsMenu}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleToggleFavorite(recipient)}
            >
              <Star 
                size={18} 
                color={recipient.is_favorite ? "#fbbf24" : "#6b7280"}
                fill={recipient.is_favorite ? "#fbbf24" : "none"}
              />
              <Text style={styles.actionText}>
                {recipient.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleEditRecipient(recipient)}
            >
              <Edit3 size={18} color="#6b7280" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleDeleteRecipient(recipient)}
            >
              <Trash2 size={18} color="#ef4444" />
              <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const favoriteRecipients = recipients.filter(r => r.is_favorite);
  const otherRecipients = recipients.filter(r => !r.is_favorite);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recipients</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <Plus size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading recipients...</Text>
          </View>
        ) : (
          <>
            {recipients.length === 0 ? (
              <View style={styles.emptyContainer}>
                <User size={48} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No Recipients Yet</Text>
                <Text style={styles.emptyText}>
                  Add your first recipient to start sending money
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddButton}
                  onPress={() => setShowForm(true)}
                >
                  <Plus size={20} color="#2563eb" />
                  <Text style={styles.emptyAddButtonText}>Add Recipient</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Favorite Recipients */}
                {favoriteRecipients.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Favorites</Text>
                    {favoriteRecipients.map(renderRecipientCard)}
                  </View>
                )}

                {/* Other Recipients */}
                {otherRecipients.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {favoriteRecipients.length > 0 ? 'All Recipients' : 'Recipients'}
                    </Text>
                    {otherRecipients.map(renderRecipientCard)}
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Recipient Form Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <RecipientForm
          recipient={editingRecipient}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  emptyAddButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 8,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  recipientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedRecipientCard: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f9ff',
  },
  favoriteRecipientCard: {
    borderColor: '#fbbf24',
    backgroundColor: '#fffbeb',
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipientInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  favoriteIcon: {
    marginLeft: 6,
  },
  recipientCountry: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  deliveryMethod: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 2,
    fontWeight: '500',
  },
  actionsButton: {
    padding: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionsMenu: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
}); 