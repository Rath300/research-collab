'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { type Database } from '@/lib/database.types';
import { useAuthStore } from '@/lib/store';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar } from '@/components/ui/Avatar';
import { 
  FiBell, 
  FiLoader, 
  FiAlertCircle, 
  FiMessageSquare, 
  FiUsers, 
  FiThumbsUp,
  FiInbox,
  FiExternalLink,
  FiCheckCircle,
  FiCircle,
  FiUser
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

type SenderProfile = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'first_name' | 'last_name' | 'avatar_url'>;

// To satisfy linter for the data assignment, then use type guard for access
type UserNotification = Database['public']['Tables']['user_notifications']['Row'] & {
  sender?: any; // Allow 'any' for now to match inferred type from Supabase query result
};

// Type guard to check if sender is a valid profile
function isSenderProfile(sender: any): sender is SenderProfile {
  return sender && typeof sender === 'object' && 'id' in sender && ('first_name' in sender || 'last_name' in sender || 'avatar_url' in sender) && !('code' in sender && 'message' in sender);
}

const NotificationIcon = ({ type }: { type: string | null }) => {
  switch (type) {
    case 'new_comment':
      return <FiMessageSquare className="h-5 w-5 text-sky-500" />;
    case 'new_follower':
      return <FiUsers className="h-5 w-5 text-green-500" />;
    case 'post_like':
      return <FiThumbsUp className="h-5 w-5 text-pink-500" />;
    case 'project_invite':
      return <FiBell className="h-5 w-5 text-purple-500" />;
    default:
      return <FiBell className="h-5 w-5 text-neutral-500" />;
  }
};

export default function NotificationsPage() {
  // supabase is already imported as a singleton
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError("User not authenticated.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('user_notifications')
        .select('*, sender:sender_id(id, first_name, last_name, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error("Supabase fetch error:", fetchError);
        throw fetchError;
      }
      // The type of `data` here is the problematic one according to the linter.
      // By setting UserNotification.sender to `any`, this assignment should pass.
      setNotifications(data || []); 

    } catch (err) {
      console.error("Error fetching notifications:", err);
      const defaultMessage = 'Failed to load notifications';
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String(err.message) || defaultMessage);
      } else {
        setError(defaultMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('user_notifications')
        .update({ is_read: true }) 
        .eq('id', notificationId);

      if (updateError) throw updateError;

      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };
  
  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const unreadNotificationIds = notifications.filter(n => !n.is_read).map(n => n.id); 
      if (unreadNotificationIds.length === 0) return;

      const { error: updateError } = await supabase
        .from('user_notifications')
        .update({ is_read: true }) 
        .in('id', unreadNotificationIds)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))); 
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  return (
    <PageContainer title="Notifications" className="bg-bg-primary min-h-screen text-text-primary font-sans">
      <div className="p-4 sm:p-6 md:p-8"> 
        <motion.div 
          className="flex justify-between items-center mb-6 md:mb-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-heading text-neutral-100">
            Notifications
          </h1>
          {notifications.some(n => !n.is_read) && ( 
             <button
                onClick={markAllAsRead}
                className="text-sm font-sans text-accent-purple hover:text-accent-purple-hover transition-colors flex items-center"
            >
                <FiCheckCircle className="mr-1.5" /> Mark all as read
            </button>
          )}
        </motion.div>

        {loading && (
          <div className="flex justify-center items-center py-20 max-w-3xl mx-auto">
            <FiLoader className="animate-spin text-accent-purple text-5xl" />
          </div>
        )}

        {error && (
          <div className="bg-neutral-900 border border-red-500/30 rounded-xl shadow-lg p-6 text-center font-sans my-6 max-w-3xl mx-auto">
            <FiAlertCircle className="mx-auto text-red-500 text-4xl mb-3" />
            <h3 className="text-lg font-heading text-neutral-100 mb-1">Error Loading Notifications</h3>
            <p className="text-neutral-400 text-sm mb-3">{error}</p>
            <button 
              onClick={fetchNotifications}
              className="px-3 py-1.5 bg-accent-purple hover:bg-accent-purple-hover text-white font-sans text-sm rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <motion.div 
            className="text-center py-20 bg-neutral-900 rounded-lg border border-neutral-800 max-w-3xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FiInbox className="mx-auto text-6xl text-neutral-600 mb-6" />
            <h3 className="text-xl font-heading text-neutral-300 mb-2">No New Notifications</h3>
            <p className="text-neutral-500 font-sans text-sm">You're all caught up!</p>
          </motion.div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <motion.div 
            className="space-y-3 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          >
            {notifications.map((notification) => {
              const senderProfile = isSenderProfile(notification.sender) ? notification.sender : null;
              const senderName = senderProfile 
                ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim() || 'Someone'
                : 'Someone';

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg flex items-start gap-3 transition-colors duration-150 ease-in-out
                              §{notification.is_read ? 'bg-neutral-900 border border-neutral-800' : 'bg-neutral-800/70 border border-neutral-700/70 hover:bg-neutral-700/60'}`}
                >
                  {!notification.is_read && (
                      <FiCircle className="h-2.5 w-2.5 text-accent-purple flex-shrink-0 mt-1.5 animate-pulse" />
                  )}
                  {notification.is_read && (
                       <div className="h-2.5 w-2.5 flex-shrink-0 mt-1.5" /> 
                  )}

                  {senderProfile ? (
                     <Avatar 
                        src={senderProfile.avatar_url} 
                        alt={senderName} 
                        size="sm"
                        fallback={<FiUser className="h-4 w-4 text-neutral-400" />}
                        className="flex-shrink-0 mt-0.5"
                    />
                  ) : (
                     <div className="flex-shrink-0 mt-0.5 p-2 bg-neutral-700 rounded-full">
                        <NotificationIcon type={notification.type} />
                     </div>
                  )}
                  
                  <div className="flex-grow">
                    <p className="text-sm text-neutral-200 mb-0.5">
                      {senderProfile && <span className="font-medium">{senderName}</span>}{' '}
                      {notification.content}
                    </p>
                    <span className="text-xs text-neutral-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {notification.link_to && (
                    <Link 
                      href={notification.link_to}
                      onClick={() => {
                          if (!notification.is_read) { 
                              markAsRead(notification.id);
                          }
                      }}
                      className="ml-auto flex-shrink-0 self-center p-1.5 rounded-md hover:bg-neutral-700 transition-colors"
                      aria-label="View details"
                    >
                      <FiExternalLink className="h-4 w-4 text-neutral-400" />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
} 