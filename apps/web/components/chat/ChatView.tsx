"use client";

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatMessage, type Message } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Avatar } from '@/components/ui/Avatar';
import { FiUser, FiArrowLeft, FiInfo, FiLoader, FiMessageSquare, FiPaperclip, FiMic } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

// TODO: Replace with actual type
export interface ChatPartner {
  id: string;
  name: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  lastSeen?: string;
}

interface ChatViewProps {
  messages: Message[];
  currentUserId: string;
  chatPartner?: ChatPartner | null;
  onSendMessage: (messageText: string) => void;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  onBack?: () => void; // For mobile view to go back to sidebar
}

export function ChatView({
  messages,
  currentUserId,
  chatPartner,
  onSendMessage,
  isLoadingMessages,
  isSendingMessage,
  onBack,
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  if (!chatPartner && !isLoadingMessages) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white text-text-secondary p-8">
        <FiMessageSquare size={64} className="mb-4 text-text-secondary"/>
        <p className="text-xl font-heading text-text-primary">Select a conversation</p>
        <p className="mt-1 text-sm">Choose a chat from the sidebar to start messaging.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col h-full bg-white"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Chat Header */} 
      {chatPartner && (
        <header className="bg-gray-50 border-b border-border-light p-3 sm:p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="mr-2 sm:hidden text-text-secondary hover:bg-gray-100 !p-2 rounded-full">
                    <FiArrowLeft size={22} />
                </Button>
            )}
            <Avatar 
              src={chatPartner.avatarUrl} 
              alt={chatPartner.name} 
              size="md" 
              className="mr-3"
              fallback={<FiUser className="text-text-secondary"/>}
            />
            <div>
              <h2 className="font-semibold text-base sm:text-lg text-text-primary font-heading truncate max-w-[150px] sm:max-w-xs">{chatPartner.name}</h2>
              <p className="text-xs text-text-secondary font-sans">
                {chatPartner.isOnline ? <span className='text-green-500'>Online</span> : (chatPartner.lastSeen || 'Offline')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary hover:bg-gray-100 !p-2 rounded-full">
            <FiInfo size={20} />
          </Button>
        </header>
      )}

      {/* Messages Area */} 
      <motion.div 
        className="flex-grow p-4 sm:p-6 space-y-2 overflow-y-auto bg-white"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoadingMessages && (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <FiLoader className="animate-spin text-accent-primary text-4xl mb-3" />
            <p className="text-sm">Loading messages...</p>
          </div>
        )}
        {!isLoadingMessages && messages.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <FiMessageSquare size={48} className="mb-4 text-text-secondary"/>
            <p className="text-lg font-heading text-text-primary">No messages yet</p>
            <p className="mt-1 text-xs">Be the first to send a message to {chatPartner?.name || 'this user'}.</p>
          </div>
        )}
        {!isLoadingMessages && messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isCurrentUser={msg.sender_id === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Message Input Area */} 
      {chatPartner && (
          <ChatInput onSendMessage={onSendMessage} isLoading={isSendingMessage} />
      )}
    </motion.div>
  );
} 