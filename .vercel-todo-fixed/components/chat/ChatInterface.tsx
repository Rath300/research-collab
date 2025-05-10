import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiSend, FiUser, FiClock } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getMessagesForMatch, sendMessage, setupMessageListener } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!matchId || !user) return;
      
      try {
        setIsLoading(true);
        const data = await getMessagesForMatch(matchId);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [matchId, user]);
  
  // Set up real-time listener for new messages
  useEffect(() => {
    if (!matchId || !user) return;
    
    // Subscribe to new messages
    const unsubscribe = setupMessageListener(matchId, (newMessage) => {
      setMessages((prevMessages) => {
        // Check if this message is already in the list to avoid duplicates
        const exists = prevMessages.some(msg => msg.id === newMessage.id);
        if (exists) return prevMessages;
        
        return [...prevMessages, newMessage];
      });
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [matchId, user]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !user || !matchId) return;
    
    try {
      setIsSending(true);
      
      await sendMessage({
        match_id: matchId,
        sender_id: user.id,
        receiver_id: recipientId,
        content: messageText.trim()
      });
      
      // Clear input field (note: the new message will come via the subscription)
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden mr-3">
          {recipientAvatar ? (
            <img 
              src={recipientAvatar} 
              alt={recipientName}
              className="h-full w-full object-cover"
            />
          ) : (
            <FiUser className="text-primary-600" size={20} />
          )}
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {recipientName}
          </h3>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = user?.id === message.sender_id;
            const timestamp = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    isCurrentUser 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <div 
                    className={`flex items-center text-xs mt-1 ${
                      isCurrentUser ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <FiClock size={10} className="mr-1" />
                    <span>{timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1"
            disabled={isSending}
          />
          
          <Button
            type="submit"
            disabled={!messageText.trim() || isSending}
            isLoading={isSending}
          >
            <FiSend size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
} 