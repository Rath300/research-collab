'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import { FiBell, FiUser, FiMessageSquare } from 'react-icons/fi';
import Link from 'next/link';

export function NotificationBell() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'new_direct_match')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // Optionally, subscribe to real-time updates here
  }, [fetchNotifications]);

  const handleOpen = () => {
    setOpen(!open);
    if (!open && notifications.some(n => !n.is_read)) {
      // Mark all as read
      supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('type', 'new_direct_match')
        .eq('is_read', false)
        .then(() => fetchNotifications());
    }
  };

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative focus:outline-none">
        <FiBell className="w-6 h-6 text-neutral-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-neutral-800 font-semibold text-neutral-100">New Matches</div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-neutral-400 text-center">No new matches</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex items-center px-4 py-3 border-b border-neutral-800 last:border-b-0">
                  <FiUser className="w-5 h-5 text-accent-purple mr-3" />
                  <div className="flex-1">
                    <div className="text-neutral-200 text-sm font-medium">{n.content}</div>
                    <div className="text-xs text-neutral-500">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  {n.link_to && (
                    <Link href={n.link_to} className="ml-3 text-accent-purple hover:underline flex items-center">
                      <FiMessageSquare className="mr-1" /> Chat
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 