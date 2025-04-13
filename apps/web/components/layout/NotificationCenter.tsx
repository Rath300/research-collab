import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FiBell, FiX, FiMessageSquare, FiUsers, FiInfo } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getNotifications, markNotificationAsRead, setupNotificationsListener } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'match' | 'system' | 'mention';
  title: string;
  body: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationCenter() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load initial notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await getNotifications(user.id);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotifications();
  }, [user]);
  
  // Set up real-time listener for new notifications
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to new notifications
    const unsubscribe = setupNotificationsListener(user.id, (newNotification) => {
      setNotifications((prev) => {
        // Check if this notification is already in the list to avoid duplicates
        const exists = prev.some(n => n.id === newNotification.id);
        if (exists) return prev;
        
        // Add new notification at the beginning of the array
        return [newNotification, ...prev];
      });
      
      // Increment unread count
      if (!newNotification.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [user]);
  
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        // Mark as read in the database
        await markNotificationAsRead(notification.id);
        
        // Update local state
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
        
        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Navigate if there's a link
    if (notification.link) {
      router.push(notification.link);
      setIsOpen(false);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      // Mark all as read in the database
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      for (const id of unreadIds) {
        await markNotificationAsRead(id);
      }
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <FiMessageSquare className="text-blue-500" size={20} />;
      case 'match':
        return <FiUsers className="text-green-500" size={20} />;
      default:
        return <FiInfo className="text-primary-500" size={20} />;
    }
  };
  
  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium">Notifications</h3>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-sm"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <FiX size={18} />
              </Button>
            </div>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <p>No notifications</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </p>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.body}
                        </p>
                        
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      
                      {!notification.is_read && (
                        <div className="ml-2">
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 