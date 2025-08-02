"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { FiUser, FiSearch, FiMessageSquare, FiPlus } from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// TODO: Replace with actual type from Supabase schema if available
interface Conversation {
  id: string;
  partnerName: string;
  partnerAvatarUrl?: string | null;
  lastMessage: string;
  lastMessageTimestamp: string; // Or Date object
  unreadCount?: number;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversationId?: string | null;
  onSelectConversation: (conversationId: string) => void;
  currentUserId?: string;
}

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export function ChatSidebar({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation,
  currentUserId
}: ChatSidebarProps) {
  // Dummy data for now
  // const dummyConversations: Conversation[] = [
  //   { id: '1', partnerName: 'Dr. Alice Smith', lastMessage: 'Great, let\'s discuss this further.', lastMessageTimestamp: '10:30 AM', unreadCount: 2, partnerAvatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
  //   { id: '2', partnerName: 'Prof. Bob Johnson', lastMessage: 'Can you send over the draft?', lastMessageTimestamp: 'Yesterday', partnerAvatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg'  },
  //   { id: '3', partnerName: 'Researcher Alex Lee', lastMessage: 'Thanks for the insights!', lastMessageTimestamp: 'Mon', partnerAvatarUrl: null },
  // ];

  // const displayConversations = conversations.length > 0 ? conversations : dummyConversations;


  return (
    <motion.div 
      className="bg-surface-primary border-r border-border-light h-full flex flex-col w-full sm:w-80 md:w-96"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 border-b border-border-light">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-heading text-text-primary">Conversations</h2>
          {/* <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700">
            <FiPlus size={20} />
          </Button> */}
        </div>
        <div className="relative flex items-center">
            <FiSearch className="absolute left-3 text-text-secondary pointer-events-none" />
            <Input 
              placeholder="Search chats..." 
              className="bg-white border-border-light text-text-primary placeholder:text-text-secondary focus:ring-accent-primary focus:border-accent-primary pl-10 w-full"
            />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {conversations.length === 0 && (
          <motion.div 
            className="p-6 text-center text-text-secondary font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FiMessageSquare className="mx-auto text-4xl mb-3 text-text-secondary" />
            <p>No conversations yet.</p>
            <p className="text-xs mt-1">Start a new chat from a user's profile.</p>
          </motion.div>
        )}
        <motion.ul 
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          initial="hidden"
          animate="visible"
          className="divide-y divide-border-light"
        >
          {conversations.map((convo) => (
            <motion.li key={convo.id} variants={listItemVariants}>
              <button
                onClick={() => onSelectConversation(convo.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors duration-150 focus:outline-none ${
                  selectedConversationId === convo.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center">
                  <Avatar 
                    src={convo.partnerAvatarUrl} 
                    alt={convo.partnerName} 
                    size="md" 
                    className="mr-3 flex-shrink-0"
                    fallback={<FiUser className="text-text-secondary" />}
                  />
                  <div className="flex-grow overflow-hidden">
                    <h3 className="text-sm font-medium text-text-primary truncate">{convo.partnerName}</h3>
                    <p className="text-xs text-text-secondary truncate">{convo.lastMessage}</p>
                  </div>
                  <div className="ml-2 text-right flex-shrink-0">
                    <p className="text-xs text-text-secondary mb-0.5">{convo.lastMessageTimestamp}</p>
                    {convo.unreadCount && convo.unreadCount > 0 && (
                      <span className="bg-accent-primary text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </div>
      
      {/* Optional: Link to find new collaborators if no chats or as a general CTA */}
      {/* <div className="p-4 border-t border-neutral-800">
        <Link href="/match" passHref>
          <Button variant="secondary" isFullWidth className="font-sans">
            <FiSearch className="mr-2"/> Find New Collaborators
          </Button>
        </Link>
      </div> */}
    </motion.div>
  );
} 