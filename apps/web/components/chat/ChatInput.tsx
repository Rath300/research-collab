"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FiSend } from 'react-icons/fi';

interface ChatInputProps {
  onSendMessage: (messageText: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [messageText, setMessageText] = useState('');

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (messageText.trim() === '') return;
    onSendMessage(messageText.trim());
    setMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      handleSubmit();
    }
  };

  return (
    <motion.div 
      className="bg-gray-50 border-t border-border-light p-3 sm:p-4"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-3">
        <Textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Shift+Enter for new line)"
          rows={1}
          className="flex-grow bg-white border-border-light text-text-primary placeholder:text-text-secondary focus:ring-accent-primary focus:border-accent-primary resize-none max-h-32 py-2.5 px-3.5"
        />
        <Button 
          type="submit" 
          variant="primary" 
          size="lg"
          isLoading={isLoading}
          disabled={isLoading || messageText.trim() === ''}
          className="flex-shrink-0 rounded-full !p-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center aspect-square"
          aria-label="Send message"
        >
          {!isLoading && <FiSend size={20} className="text-white"/>}
        </Button>
      </form>
    </motion.div>
  );
} 