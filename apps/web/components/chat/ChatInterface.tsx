import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiSend, FiUser, FiClock, FiLoader, FiMessageCircle, FiSmile } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getMessagesForMatch, sendMessage, setupMessageListener, markMessagesAsRead } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { useChatStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';

interface ChatMessage {
  id: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at?: string | null;
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url?: string | null;
  };
}

interface ChatInterfaceProps {
  matchId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string | null;
}

export function ChatInterface({ 
  matchId, 
  recipientId, 
  recipientName, 
  recipientAvatar 
}: ChatInterfaceProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { resetUnreadCount: resetGlobalUnreadCount } = useChatStore();
  
  useEffect(() => {
    const loadAndMarkMessages = async () => {
      if (!matchId || !user) return;
      
      setIsLoading(true);
      try {
        const data = await getMessagesForMatch(matchId);
        setMessages(data);
        if (data.length > 0) {
          await markMessagesAsRead(matchId, user.id);
          resetGlobalUnreadCount(recipientId);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAndMarkMessages();
  }, [matchId, user, recipientId, resetGlobalUnreadCount]);
  
  useEffect(() => {
    if (!matchId || !user) return;
    
    const unsubscribe = setupMessageListener(matchId, (newMessage: ChatMessage) => {
      setMessages((prevMessages) => {
        const exists = prevMessages.some(msg => msg.id === newMessage.id);
        if (exists) return prevMessages;
        return [...prevMessages, newMessage];
      });
      if (newMessage.receiver_id === user.id && !newMessage.is_read) {
        markMessagesAsRead(matchId, user.id).then(() => {
          resetGlobalUnreadCount(recipientId);
        }).catch(err => console.error("Error marking new message as read:", err));
      }
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [matchId, user, recipientId, resetGlobalUnreadCount]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user || !matchId) return;
    
    setIsSending(true);
    try {
      await sendMessage({
        match_id: matchId,
        sender_id: user.id,
        receiver_id: recipientId,
        content: messageText.trim()
      });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl overflow-hidden">
      {/* Chat header */}
      <div className="p-4 border-b border-white/10 flex items-center space-x-3 shadow-sm">
        <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center overflow-hidden ring-1 ring-white/20">
          <Avatar 
            src={recipientAvatar} 
            alt={recipientName} 
            size="md"
            fallback={<FiUser className="text-researchbee-yellow" size={22} />} 
          />
        </div>
        
        <div>
          <h3 className="font-semibold text-lg text-white">
            {recipientName}
          </h3>
        </div>
      </div>
      
      {/* Messages Area: Transparent background, inherits from parent glass-card */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {isLoading ? (
          <motion.div 
            className="flex flex-col items-center justify-center h-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FiLoader className="animate-spin text-researchbee-yellow text-5xl" />
            <p className="mt-4 text-gray-300 text-lg">Loading messages...</p>
          </motion.div>
        ) : messages.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center h-full text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FiSmile className="text-researchbee-yellow text-6xl mb-5 opacity-80" />
            <h3 className="text-xl font-semibold text-white mb-2">It&apos;s quiet in here...</h3>
            <p className="text-gray-400 text-md max-w-xs">
              No messages in this chat yet. Why not break the ice and send the first message?
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const isCurrentUser = user?.id === message.sender_id;
              const timestamp = message.created_at && !isNaN(new Date(message.created_at).getTime()) 
                ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true }) 
                : 'Sending...';
              
              return (
                <motion.div
                  key={message.id} 
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: index * 0.05 // Stagger animation for initial load
                  }}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end max-w-[80%] sm:max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} space-x-2 space-x-reverse`}>
                    <div 
                      className={`rounded-xl px-3.5 py-2.5 shadow-md backdrop-blur-md break-words whitespace-pre-wrap text-sm sm:text-base leading-relaxed ${
                        isCurrentUser 
                          ? 'bg-researchbee-yellow/80 text-black rounded-br-none' 
                          : 'bg-white/10 text-gray-100 rounded-bl-none'
                      }`}
                    >
                      {message.content}
                      <div 
                        className={`text-xs mt-1.5 flex items-center ${isCurrentUser ? 'text-black/60 justify-end' : 'text-gray-400/80 justify-start'}`}
                      >
                        <FiClock size={10} className="mr-1" />
                        <span>{timestamp}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input area */} 
      <div className="p-3 sm:p-4 border-t border-white/10 bg-black/10 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-3">
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 bg-white/5 border-white/20 placeholder-gray-400/60 text-white !py-2.5 sm:!py-3"
            disabled={isSending}
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={!messageText.trim() || isSending}
            isLoading={isSending}
            className="bg-researchbee-yellow hover:bg-researchbee-darkyellow text-black rounded-lg !p-0 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 shadow-md"
            aria-label="Send message"
          >
            {!isSending && <FiSend size={18} />}
          </Button>
        </form>
      </div>
    </div>
  );
} 