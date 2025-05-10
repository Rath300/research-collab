'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiCheckCircle, FiClock } from 'react-icons/fi';
import { Message } from '../lib/types';

interface ChatMessageProps {
  message: Message & { 
    is_self: boolean; 
    is_read?: boolean;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { 
    content, 
    created_at, 
    is_self, 
    is_read = false,
  } = message;
  
  // Format timestamp
  const timestamp = created_at 
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true }) 
    : '';
  
  // Create short timestamp for hover
  const fullTimestamp = created_at 
    ? new Date(created_at).toLocaleString() 
    : '';
  
  return (
    <div 
      className={`flex mb-4 ${
        is_self ? 'justify-end' : 'justify-start'
      }`}
    >
      <div 
        className={`relative max-w-[80%] px-4 py-2 rounded-lg ${
          is_self 
            ? 'bg-primary-600 text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none dark:bg-gray-800 dark:text-gray-200'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        
        <div className="flex items-center mt-1 space-x-1">
          <span 
            className={`text-xs ${
              is_self ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'
            }`}
            title={fullTimestamp}
          >
            {timestamp}
          </span>
          
          {is_self && (
            <span className="text-primary-200">
              {is_read ? (
                <FiCheckCircle size={12} title="Read" />
              ) : (
                <FiClock size={12} title="Sent" />
              )}
            </span>
          )}
        </div>
        
        {/* Message tail */}
        <div 
          className={`absolute top-0 w-4 h-4 ${
            is_self 
              ? 'right-0 -mr-2 bg-primary-600' 
              : 'left-0 -ml-2 bg-gray-100 dark:bg-gray-800'
          }`}
          style={{
            clipPath: is_self 
              ? 'polygon(0 0, 100% 0, 100% 100%)' 
              : 'polygon(0 0, 100% 0, 0 100%)',
          }}
        />
      </div>
    </div>
  );
} 