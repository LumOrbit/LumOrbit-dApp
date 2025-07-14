import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Database } from '@/lib/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data);
        setUnreadCount(data.filter(notification => !notification.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up real-time subscription for notifications
      const subscription = supabase
        .channel('notifications_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newNotification = payload.new as Notification;
              setNotifications(prev => [newNotification, ...prev]);
              if (!newNotification.is_read) {
                setUnreadCount(prev => prev + 1);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedNotification = payload.new as Notification;
              setNotifications(prev => 
                prev.map(notification => 
                  notification.id === updatedNotification.id ? updatedNotification : notification
                )
              );
              // Recalculate unread count
              setNotifications(prev => {
                const newUnreadCount = prev.filter(n => !n.is_read).length;
                setUnreadCount(newUnreadCount);
                return prev;
              });
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old.id;
              setNotifications(prev => {
                const filtered = prev.filter(notification => notification.id !== deletedId);
                setUnreadCount(filtered.filter(n => !n.is_read).length);
                return filtered;
              });
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user, fetchNotifications]);

  const createNotification = async (notificationData: Omit<Database['public']['Tables']['notifications']['Insert'], 'user_id'>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return { error };
      }

      // Note: real-time subscription will handle state update
      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: false })
        .eq('id', notificationId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const markAllAsRead = async () => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteAllRead = async () => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true);

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const getNotificationsByType = (type: string) => {
    return notifications.filter(notification => notification.type === type);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.is_read);
  };

  const getReadNotifications = () => {
    return notifications.filter(notification => notification.is_read);
  };

  return {
    notifications,
    loading,
    unreadCount,
    createNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    getNotificationsByType,
    getUnreadNotifications,
    getReadNotifications,
    refetch: fetchNotifications,
  };
}

// Utility functions for creating common notification types
export const createTransferNotification = async (userId: string, transferId: string, title: string, message: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type: 'transfer_update',
        transfer_id: transferId,
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const createSecurityNotification = async (userId: string, title: string, message: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type: 'security',
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const createPromotionNotification = async (userId: string, title: string, message: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type: 'promotion',
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const createSystemNotification = async (userId: string, title: string, message: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type: 'system',
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}; 