'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/trpc';
import { FiCheck } from 'react-icons/fi';

export default function NotificationsPage() {
  const markAllAsRead = api.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      // Refetch notifications to update the UI
      window.location.reload();
    },
  });

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <PageContainer title="Notifications" className="bg-bg-primary min-h-screen">
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-heading text-text-primary">Notifications</h1>
            <Button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              variant="outline"
              size="sm"
              className="text-text-secondary hover:text-text-primary"
            >
              {markAllAsRead.isPending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiCheck className="w-4 h-4" />
              )}
              Mark All as Read
            </Button>
          </div>
          
          <NotificationsList />
        </div>
      </div>
    </PageContainer>
  );
} 