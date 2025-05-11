import { type Tables } from '@/types/database.types';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, MessageSquare, UserPlus } from 'lucide-react'; // Example icons

export interface NotificationItemProps {
  notification: Tables<'user_notifications'>;
  onMarkAsRead?: (notificationId: string) => void;
}

function getIconForNotificationType(type: string) {
  switch (type) {
    case 'new_direct_match':
      return <UserPlus className="h-5 w-5 text-blue-500" />;
    case 'new_message':
      return <MessageSquare className="h-5 w-5 text-green-500" />;
    case 'project_update': // Example type
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <CheckCircle className="h-5 w-5 text-gray-400" />;
  }
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const { id, content, created_at, is_read, link_to, type } = notification;
  const Icon = getIconForNotificationType(type);

  const formattedDate = new Date(created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handleNotificationClick = () => {
    if (!is_read && onMarkAsRead) {
      onMarkAsRead(id);
    }
    // Navigation will be handled by Link if link_to exists
  };

  const renderContent = () => (
    <div 
        className={`p-3 rounded-lg transition-colors ${is_read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50'}`}
        onClick={!link_to ? handleNotificationClick : undefined} // If no link, click marks as read
    >
      <div className="flex items-start space-x-3">
        <span className="mt-1">{Icon}</span>
        <div className="flex-1">
          <p className={`text-sm ${is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
            {content}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formattedDate}</p>
        </div>
        {!is_read && onMarkAsRead && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleNotificationClick(); }} 
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            title="Mark as read"
          >
            <CheckCircle className="h-5 w-5 text-gray-400 hover:text-green-500" />
          </button>
        )}
      </div>
    </div>
  );

  if (link_to) {
    return (
      <Link href={link_to} passHref legacyBehavior>
        <a onClick={handleNotificationClick} className="block no-underline hover:no-underline">
          {renderContent()}
        </a>
      </Link>
    );
  }

  return renderContent();
} 