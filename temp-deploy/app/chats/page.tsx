'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { 
  FiSend, 
  FiSearch, 
  FiUser, 
  FiEdit, 
  FiMoreVertical,
  FiChevronLeft
} from 'react-icons/fi';
import { useAuthStore, useChatStore } from '@/lib/store';
// Import Supabase client directly
import { getBrowserClient } from '@/lib/supabase';
import { Message, Profile, Match } from '@/lib/schema';

// Wrapper component for client-side only features
function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams?.get('id');
  
  const { user } = useAuthStore();
  const { 
    currentChatUserId, 
    unreadMessages, 
    setCurrentChatUserId, 
    setUnreadCount 
  } = useChatStore();
  
  const [matchesList, setMatchesList] = useState<(Match & { profiles: Profile })[]>([]);
  const [messagesList, setMessagesList] = useState<(Message & { is_self?: boolean; read?: boolean })[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match & { profiles: Profile } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  // Load user matches directly using Supabase
  const loadMatches = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      setError('');
      
      const supabase = getBrowserClient();
      const { data, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          user1:user_id_1(id, first_name, last_name, avatar_url, title, institution),
          user2:user_id_2(id, first_name, last_name, avatar_url, title, institution)
        `)
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
        .eq('status', 'matched');
      
      if (matchError) throw matchError;
      
      // Cast data to the expected type
      setMatchesList(data as unknown as (Match & { profiles: Profile })[]);
      
      // If chatId is set, select that chat
      if (chatId) {
        const match = data.find((m) => 
          m.user_id_1 === chatId || m.user_id_2 === chatId
        );
        
        if (match) {
          const chatUserId = match.user_id_1 === user.id 
            ? match.user_id_2 
            : match.user_id_1;
          
          setCurrentChatUserId(chatUserId);
          setSelectedMatch(match as unknown as Match & { profiles: Profile });
          setShowMobileChat(true);
        }
      } else if (data.length > 0 && !currentChatUserId) {
        // Select first match by default
        const firstMatch = data[0];
        const chatUserId = firstMatch.user_id_1 === user.id 
          ? firstMatch.user_id_2 
          : firstMatch.user_id_1;
        
        setCurrentChatUserId(chatUserId);
        setSelectedMatch(firstMatch as unknown as Match & { profiles: Profile });
      } else if (currentChatUserId) {
        // Find the current selected match
        const match = data.find((m) => 
          m.user_id_1 === currentChatUserId || m.user_id_2 === currentChatUserId
        );
        
        if (match) {
          setSelectedMatch(match as unknown as Match & { profiles: Profile });
          setShowMobileChat(true);
        }
      }
    } catch (err: any) {
      console.error('Error loading matches:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load chat messages
  const loadMessages = async () => {
    try {
      if (!user || !currentChatUserId || !selectedMatch) return;
      
      setIsLoading(true);
      
      // Get match ID from selectedMatch
      const matchId = selectedMatch.id;
      
      const supabase = getBrowserClient();
      const { data, error: messagesError } = await supabase
        .from('messages')
        .select('*, sender:sender_id(first_name, last_name, avatar_url), receiver:receiver_id(first_name, last_name, avatar_url)')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false });
      
      if (messagesError) throw messagesError;
      
      // Transform messages to add is_self property
      const transformedMessages = (data || []).map((msg) => ({
        ...msg,
        is_self: msg.sender_id === user.id,
        read: msg.is_read // Map is_read to read for compatibility
      } as Message & { is_self: boolean; read: boolean }));
      
      setMessagesList(transformedMessages);
      
      // Mark messages as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('match_id', matchId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      
      if (updateError) throw updateError;
      
      setUnreadCount(currentChatUserId, 0);
      
      // Scroll to bottom
      scrollToBottom();
    } catch (err: any) {
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);
  
  useEffect(() => {
    if (currentChatUserId && selectedMatch) {
      loadMessages();
    }
  }, [currentChatUserId, selectedMatch]);
  
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!messageText.trim() || !user || !currentChatUserId || !selectedMatch) return;
    
    try {
      setIsSending(true);
      
      // Send message using direct Supabase call
      const messageData = {
        content: messageText.trim(),
        sender_id: user.id,
        receiver_id: currentChatUserId,
        match_id: selectedMatch.id,
        is_read: false,
      };
      
      const supabase = getBrowserClient();
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add message to list with is_self flag as a custom property
      setMessagesList([...messagesList, { 
        ...newMessage as unknown as Message, 
        is_self: true,
        read: false 
      } as Message & { is_self: boolean; read: boolean }]);
      
      // Clear input
      setMessageText('');
      
      // Scroll to bottom
      scrollToBottom();
    } catch (err: any) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSelectChat = (match: Match & { profiles: Profile }) => {
    const chatUserId = match.user_id_1 === user?.id 
      ? match.user_id_2 
      : match.user_id_1;
    
    setCurrentChatUserId(chatUserId);
    setSelectedMatch(match);
    setShowMobileChat(true);
    
    // Update URL
    router.push(`/chats?id=${chatUserId}`);
  };
  
  const getOtherUserFullName = (match: Match & { profiles: Profile }) => {
    return `${match.profiles.first_name} ${match.profiles.last_name}`;
  };
  
  if (!user) {
    // Redirect to login if not authenticated
    router.push('/login');
    return null;
  }
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] bg-white rounded-lg shadow-md overflow-hidden dark:bg-slate-800">
        {/* Chat list - hidden on mobile when a chat is selected */}
        <div 
          className={`w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 ${
            showMobileChat ? 'hidden md:block' : 'block'
          }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Input
                placeholder="Search conversations..."
                className="pr-10"
              />
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {matchesList.length > 0 ? (
              matchesList.map((match) => {
                const chatUserId = match.user_id_1 === user.id 
                  ? match.user_id_2 
                  : match.user_id_1;
                
                const isSelected = currentChatUserId === chatUserId;
                const unreadCount = unreadMessages[chatUserId] || 0;
                
                return (
                  <div 
                    key={match.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                    onClick={() => handleSelectChat(match)}
                  >
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                      {match.profiles.avatar_url ? (
                        <img 
                          src={match.profiles.avatar_url} 
                          alt={getOtherUserFullName(match)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FiUser className="text-primary-600" size={24} />
                      )}
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className={`text-sm font-medium truncate ${
                          unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'
                        }`}>
                          {getOtherUserFullName(match)}
                        </p>
                        
                        {unreadCount > 0 && (
                          <span className="ml-1 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                        {match.profiles.institution || 'Researcher'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Match with researchers to start chatting
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => router.push('/collaborators')}
                >
                  Find Collaborators
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Chat window - shown on mobile only when a chat is selected */}
        <div 
          className={`w-full md:w-2/3 flex flex-col ${
            showMobileChat ? 'block' : 'hidden md:block'
          }`}
        >
          {currentChatUserId && selectedMatch ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <Button 
                  variant="ghost" 
                  className="md:hidden mr-2 p-2"
                  onClick={() => setShowMobileChat(false)}
                >
                  <FiChevronLeft size={20} />
                </Button>
                
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                  {selectedMatch.profiles.avatar_url ? (
                    <img 
                      src={selectedMatch.profiles.avatar_url} 
                      alt={getOtherUserFullName(selectedMatch)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-primary-600" size={20} />
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <p className="font-medium">{getOtherUserFullName(selectedMatch)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedMatch.profiles.institution || 'Researcher'}
                  </p>
                </div>
                
                <Button variant="ghost" className="p-2">
                  <FiMoreVertical size={20} />
                </Button>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                {messagesList.length > 0 ? (
                  <div>
                    {messagesList.map((message) => (
                      <ChatMessage 
                        key={message.id} 
                        message={message}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Say hello to start the conversation
                    </p>
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    className="ml-2"
                    disabled={!messageText.trim() || isSending}
                    isLoading={isSending}
                  >
                    <FiSend size={18} />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <FiEdit size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-xl font-bold">Select a conversation</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Choose a chat from the list to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense boundary to handle useSearchParams() hook
export default function ChatsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading chat interface...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}