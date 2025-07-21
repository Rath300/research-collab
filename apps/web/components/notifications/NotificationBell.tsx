'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import { type Tables } from '@/types/database.types';
import { NotificationItem } from './NotificationItem';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotificationBell() {
  // supabase is already imported as a singleton
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Tables<'user_notifications'>[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10); // Get recent 10, or paginate later

      if (error) throw error;
      setNotifications(data || []);
      
      // Calculate unread count separately or use the total count from a specific unread query
      const { count: unread } = await supabase
        .from('user_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(unread || 0);

    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-notifications-channel')
      .on<'postgres_changes'>(
        { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('New notification received:', payload.new);
          setNotifications(prev => [payload.new as Tables<'user_notifications'>, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id || ''); // Ensure user owns it

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
        const { error } = await supabase
            .from('user_notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        
        if (error) throw error;

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true }) ) );
        setUnreadCount(0);
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
    }
  };

  if (!user) return null; // Don't render if no user

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
            {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
                    <CheckCheck className="h-4 w-4 mr-1"/> Mark all as read
                </Button>
            )}
          </div>
          {loading && <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</div>}
          {!loading && notifications.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">You have no new notifications.</div>
          )}
          {!loading && notifications.length > 0 && (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map(notif => (
                <NotificationItem 
                  key={notif.id} 
                  notification={notif} 
                  onMarkAsRead={handleMarkAsRead} 
                />
              ))}
            </div>
          )}
           <div className="p-2 text-center border-t border-gray-200 dark:border-gray-700">
              <a 
                href="/notifications" // Link to a potential dedicated notifications page
                onClick={() => setIsOpen(false)} // Close dropdown on click
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all notifications
              </a>
            </div>
        </div>
      )}
    </div>
  );
} 