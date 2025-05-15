'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { FiUser } from 'react-icons/fi';
import { format } from 'date-fns';

// TODO: Replace with actual type from Supabase schema
export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string; // ISO string date
  sender_avatar_url?: string | null;
  sender_name?: string;
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const alignment = isCurrentUser ? 'items-end' : 'items-start';
  const bubbleStyles = isCurrentUser
    ? 'bg-accent-purple text-white'
    : 'bg-neutral-700 text-neutral-100';
  const borderRadius = isCurrentUser
    ? 'rounded-l-xl rounded-tr-xl'
    : 'rounded-r-xl rounded-tl-xl';

  const formattedTime = message.created_at 
    ? format(new Date(message.created_at), 'p') 
    : '';

  return (
    <motion.div
      className={`flex flex-col ${alignment} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-xs sm:max-w-md md:max-w-lg`}>
        {!isCurrentUser && (
          <Avatar 
            src={message.sender_avatar_url} 
            alt={message.sender_name || 'Sender'} 
            size="sm" 
            className="mr-2 mb-1 flex-shrink-0"
            fallback={<FiUser className="text-neutral-400"/>}
          />
        )}
        <div className={`px-4 py-3 ${bubbleStyles} ${borderRadius} shadow-md`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
      <p className={`text-xs text-neutral-500 mt-1 ${isCurrentUser ? 'mr-1' : 'ml-10'}`}>
        {formattedTime}
      </p>
    </motion.div>
  );
} 