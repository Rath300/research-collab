'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { api } from '@/lib/trpc';
import { FiBell, FiCheck, FiX, FiUser, FiUsers, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function NotificationsList() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  const { data: notifications, refetch } = api.notifications.list.useQuery();
  const markAsRead = api.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleMarkAsRead = async (notificationId: string) => {
    setIsLoading(notificationId);
    try {
      await markAsRead.mutateAsync({ id: notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'collaboration_request':
        return <FiUsers className="w-5 h-5 text-blue-600" />;
      case 'collaboration_accepted':
        return <FiCheck className="w-5 h-5 text-green-600" />;
      case 'collaboration_declined':
        return <FiX className="w-5 h-5 text-red-600" />;
      case 'message':
        return <FiMessageSquare className="w-5 h-5 text-purple-600" />;
      default:
        return <FiBell className="w-5 h-5 text-text-secondary" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'collaboration_request':
        return 'border-l-blue-500 bg-blue-50';
      case 'collaboration_accepted':
        return 'border-l-green-500 bg-green-50';
      case 'collaboration_declined':
        return 'border-l-red-500 bg-red-50';
      case 'message':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (!notifications || notifications.length === 0) {
    return (
      <Card className="bg-white border border-border-light shadow-sm">
        <CardHeader>
          <CardTitle className="text-text-primary text-lg font-heading flex items-center gap-2">
            <FiBell className="text-accent-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FiBell className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No notifications yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-border-light shadow-sm">
      <CardHeader>
        <CardTitle className="text-text-primary text-lg font-heading flex items-center gap-2">
          <FiBell className="text-accent-primary" />
          Notifications ({notifications.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                  notification.is_read ? 'opacity-60' : 'opacity-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-text-primary font-medium">
                        {notification.content}
                      </p>
                      <p className="text-text-secondary text-sm mt-1">
                        {new Date(notification.created_at).toLocaleDateString()} at{' '}
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </p>
                      {notification.link_to && (
                        <Link 
                          href={notification.link_to}
                          className="text-accent-primary hover:underline text-sm mt-2 inline-block"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {!notification.is_read && (
                    <Button
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={isLoading === notification.id}
                      variant="ghost"
                      size="sm"
                      className="text-text-secondary hover:text-text-primary"
                    >
                      {isLoading === notification.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiCheck className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
} 