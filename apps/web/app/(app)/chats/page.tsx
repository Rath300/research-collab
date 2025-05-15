"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatView, type ChatPartner } from '@/components/chat/ChatView';
import { type Message as ChatMessageType } from '@/components/chat/ChatMessage';
import { getBrowserClient } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import { type Database } from '@/lib/database.types';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import { FiMessageSquare } from 'react-icons/fi';

type UserProfile = Database['public']['Tables']['profiles']['Row'];
type MatchRow = Database['public']['Tables']['matches']['Row'];
type RawMessage = Database['public']['Tables']['messages']['Row'];

interface DisplayConversation {
  id: string; // This will be the match_id from the 'matches' table
  partnerId: string;
  partnerName: string;
  partnerAvatarUrl?: string | null;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount?: number;
  last_active_at: string; 
}

export default function ChatsPage() {
  const supabase = getBrowserClient();
  const { user, profile: currentUserProfile, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<DisplayConversation[]>([]);
  const [selectedConversationPartner, setSelectedConversationPartner] = useState<ChatPartner | null>(null);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializingSession, setIsInitializingSession] = useState(false);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);

  // Minor comment to signify recent review: 2023-10-27
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  const getOrCreateMatch = useCallback(async (partnerId: string): Promise<string | null> => {
    if (!user) return null;
    setIsInitializingSession(true);
    setError(null);

    // Ensure consistent ordering of user IDs for querying/creating matches
    const [user1, user2] = [user.id, partnerId].sort();

    const { data: existingMatches, error: fetchError } = await supabase
      .from('matches')
      .select('id')
      .eq('user_id_1', user1)
      .eq('user_id_2', user2)
      .limit(1);

    if (fetchError) {
      console.error("Error fetching match:", fetchError);
      setError(`Chat Error: Failed to check existing session (F1). ${fetchError.message}`);
      setIsInitializingSession(false);
      return null;
    }

    if (existingMatches && existingMatches.length > 0) {
      setIsInitializingSession(false);
      return existingMatches[0].id;
    }

    // Create a new match if one doesn't exist
    const { data: newMatch, error: insertError } = await supabase
      .from('matches')
      .insert({
        user_id_1: user1,
        user_id_2: user2,
        status: 'matched', // Changed from 'active' to 'matched'
      })
      .select('id')
      .single();

    if (insertError) {
      console.error("Error creating match:", insertError);
      setError(`Chat Error: Failed to create new session (I1). ${insertError.message}`);
      setIsInitializingSession(false);
      return null;
    }
    setIsInitializingSession(false);
    return newMatch?.id || null;
  }, [user, supabase]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingConversations(true);
    setError(null);

    try {
      const { data: userMatches, error: matchesError } = await supabase
        .from('matches')
        .select('*, user1_profile:profiles!matches_user_id_1_fkey(*), user2_profile:profiles!matches_user_id_2_fkey(*)')
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
        .order('updated_at', { ascending: false }); // Assuming 'updated_at' is useful for sorting

      if (matchesError) throw matchesError;

      if (!userMatches) {
        setConversations([]);
        setIsLoadingConversations(false);
        return;
      }

      const convPromises = userMatches.map(async (match) => {
        const partnerProfile = match.user_id_1 === user.id ? match.user2_profile : match.user1_profile;
        if (!partnerProfile) return null; // Skip if partner profile is missing

        const { data: lastMsgData, error: lastMsgError } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('match_id', match.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        return {
          id: match.id, // This is the match_id
          partnerId: partnerProfile.id,
          partnerName: `${partnerProfile.first_name || ''} ${partnerProfile.last_name || ''}`.trim() || 'Unknown User',
          partnerAvatarUrl: partnerProfile.avatar_url,
          lastMessage: lastMsgError || !lastMsgData ? 'No messages yet' : lastMsgData.content,
          lastMessageTimestamp: lastMsgError || !lastMsgData ? '' : new Date(lastMsgData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          last_active_at: match.updated_at || match.created_at, // Use match updated_at for sorting conversations
        } as DisplayConversation;
      });

      const resolvedConversations = (await Promise.all(convPromises)).filter(Boolean) as DisplayConversation[];
      resolvedConversations.sort((a,b) => new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime());
      
      setConversations(resolvedConversations);

      const queryUserId = searchParams?.get('userId');
      if (queryUserId) {
        const targetConversation = resolvedConversations.find(c => c.partnerId === queryUserId);
        if (targetConversation && targetConversation.id !== currentMatchId) {
          handleSelectConversation(targetConversation.id, targetConversation.partnerId);
        } else if (!targetConversation && queryUserId !== user.id) {
          // If navigating to chat with new user via URL
          const matchIdForNewUser = await getOrCreateMatch(queryUserId);
          if (matchIdForNewUser) {
            // Refetch conversations to include the new one, then select it.
            // This might cause a double fetch, but ensures consistency.
            fetchConversations(); // This will eventually lead to selection via the updated list.
          }
        }
      }

    } catch (e: any) {
      console.error('Error fetching conversations:', e);
      setError(e.message || 'Failed to load conversations.');
    } finally {
      setIsLoadingConversations(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, supabase, searchParams, currentMatchId, getOrCreateMatch]); // handleSelectConversation removed to break cycle

  useEffect(() => {
    if(user) fetchConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only re-run when user changes. fetchConversations has its own deps.


  const fetchMessages = useCallback(async (matchId: string) => {
    if (!user || !matchId) return;
    setIsLoadingMessages(true);
    setMessages([]); 

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(id, first_name, last_name, avatar_url)')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: ChatMessageType[] = data.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        content: msg.content,
        created_at: msg.created_at,
        sender_avatar_url: (msg.sender as UserProfile)?.avatar_url,
        sender_name: `${(msg.sender as UserProfile)?.first_name || ''} ${(msg.sender as UserProfile)?.last_name || ''}`.trim() || 'User',
      }));
      setMessages(formattedMessages);

    } catch (e: any) {
      console.error('Error fetching messages:', e);
      setError(e.message || 'Failed to load messages.');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [user, supabase]);

  const handleSelectConversation = useCallback(async (matchIdToSelect: string, partnerIdToSelect?: string) => {
    let targetPartnerId = partnerIdToSelect;
    let targetMatchId = matchIdToSelect;
    setIsInitializingSession(true);
    setError(null);

    const conversation = conversations.find(c => c.id === matchIdToSelect);

    if (conversation) {
        targetPartnerId = conversation.partnerId;
    } else if (partnerIdToSelect) {
        // This case implies we are selecting based on a partnerId (e.g., from URL) that might not yet have a full DisplayConversation object
        // We need to ensure a match_id exists or is created.
        const newMatchId = await getOrCreateMatch(partnerIdToSelect);
        if (!newMatchId) {
            // setError already set by getOrCreateMatch if it fails
            // setError("Could not initiate chat session (S1)."); 
            setIsInitializingSession(false);
            return;
        }
        targetMatchId = newMatchId;
        // At this point, fetchConversations might need to run again if a new match was created to update the sidebar.
        // For now, we proceed with the potentially new matchId.
    } else {
        console.warn("handleSelectConversation called without sufficient info");
        setIsInitializingSession(false);
        return;
    }

    if (!targetPartnerId) {
        console.error("Partner ID could not be determined for selection.");
        setError("Chat Error: Partner ID missing (S2).");
        setIsInitializingSession(false);
        return;
    }

    const partnerProfile = conversations.find(c => c.id === targetMatchId)?.partnerId === targetPartnerId 
        ? { id: targetPartnerId, name: conversations.find(c=>c.id === targetMatchId)!.partnerName, avatarUrl: conversations.find(c=>c.id === targetMatchId)!.partnerAvatarUrl} 
        : await supabase.from('profiles').select('id, first_name, last_name, avatar_url').eq('id', targetPartnerId).single().then(res => res.data ? {id: res.data.id, name: `${res.data.first_name} ${res.data.last_name}`, avatarUrl: res.data.avatar_url} : null);

    if (!partnerProfile) {
        setError("Chat Error: Could not load partner details (S3).");
        setIsInitializingSession(false);
        return;
    }

    setSelectedConversationPartner(partnerProfile as ChatPartner);
    setCurrentMatchId(targetMatchId);
    fetchMessages(targetMatchId);
    setShowSidebarOnMobile(false);
    setIsInitializingSession(false);

    if (searchParams?.get('userId') !== targetPartnerId) {
      router.push(`/chats?userId=${targetPartnerId}`, { scroll: false });
    }
  }, [conversations, fetchMessages, router, searchParams, supabase, getOrCreateMatch]);

  const handleSendMessage = async (messageText: string) => {
    if (!user || !selectedConversationPartner || !currentMatchId) return;
    setIsSendingMessage(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedConversationPartner.id, // Still useful for notifications or direct queries if needed
        content: messageText,
        match_id: currentMatchId,
      });
      if (error) throw error;
      // Also update the match's updated_at timestamp
      await supabase.from('matches').update({ updated_at: new Date().toISOString() }).eq('id', currentMatchId);

    } catch (e: any) {
      console.error('Error sending message:', e);
      setError(e.message || 'Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  useEffect(() => {
    if (!user || !currentMatchId) return;

    const messageChannel = supabase
      .channel(`messages-for-match-${currentMatchId}`)
      .on<RawMessage>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${currentMatchId}`},
        (payload) => {
          const newMessage = payload.new as RawMessage;
          // Determine sender details for the new message
          let senderProfileForMessage: Pick<ChatPartner, 'name' | 'avatarUrl'> | null = null;
          if (newMessage.sender_id === user.id) {
            senderProfileForMessage = {
              name: `${currentUserProfile?.first_name || ''} ${currentUserProfile?.last_name || ''}`.trim() || 'You',
              avatarUrl: currentUserProfile?.avatar_url
            };
          } else if (newMessage.sender_id === selectedConversationPartner?.id) {
            senderProfileForMessage = {
              name: selectedConversationPartner.name,
              avatarUrl: selectedConversationPartner.avatarUrl
            };
          } // Potentially fetch if sender is neither (e.g. system message, though not handled here)
          
          setMessages((prevMessages) => {
              if (prevMessages.find(m => m.id === newMessage.id)) return prevMessages; // Avoid duplicates
              const formattedNewMessage: ChatMessageType = {
                  id: newMessage.id,
                  sender_id: newMessage.sender_id,
                  content: newMessage.content,
                  created_at: newMessage.created_at,
                  sender_avatar_url: senderProfileForMessage?.avatarUrl,
                  sender_name: senderProfileForMessage?.name || 'User',
              };
              return [...prevMessages, formattedNewMessage];
          });
          // Refresh conversation list to update last message and order
          fetchConversations();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to messages for match ${currentMatchId}!`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Subscription error:', err);
          setError('Connection issue, real-time updates might be delayed.');
        }
      });

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [user, supabase, currentMatchId, selectedConversationPartner, currentUserProfile, fetchConversations]);
  
  // Effect to handle initial selection from URL query parameter or select first conversation
  useEffect(() => {
    const queryUserId = searchParams?.get('userId');
    if (isLoadingConversations) return; // Wait for conversations to load

    if (queryUserId && queryUserId !== selectedConversationPartner?.id) {
        const targetConv = conversations.find(c => c.partnerId === queryUserId);
        if (targetConv) {
            handleSelectConversation(targetConv.id, targetConv.partnerId);
        } else if (user && queryUserId !== user.id) {
            // If partner from URL not in current conversations, try to initiate chat
            console.log("Attempting to initiate chat with user from URL:", queryUserId);
            getOrCreateMatch(queryUserId).then(newMatchId => {
                if (newMatchId) {
                    // After creating/finding match, fetch conversations again so sidebar updates.
                    // Then, the selection logic in fetchConversations's callback or this effect will pick it up.
                    fetchConversations();
                } else {
                    router.replace('/chats'); // Could not create/find match for this user
                }
            });
        }
    } else if (!queryUserId && conversations.length > 0 && !selectedConversationPartner && !currentMatchId) {
      // If no user in query and no chat selected, but conversations exist, select the first one.
      // handleSelectConversation(conversations[0].id, conversations[0].partnerId);
      // Decided against auto-selecting first, let user choose or use URL param.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, conversations, isLoadingConversations, user, getOrCreateMatch, router]); 
  // Removed handleSelectConversation from deps here to avoid potential loops with queryUserId check.
  // currentMatchId, selectedConversationPartner?.id are implicitly handled by other effects or checks.

  const currentUserId = useMemo(() => user?.id || '', [user]);

  if (authLoading || (!user && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-neutral-400 p-4">
        <FiLoader className="animate-spin text-4xl text-accent-purple mb-4" />
        <p>Loading authentication...</p>
      </div>
    );
  }
  
  if (isInitializingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-neutral-400 p-4">
        <FiLoader className="animate-spin text-4xl text-accent-purple mb-4" />
        <p>Initializing chat session...</p>
      </div>
    );
  }

  if (isLoadingConversations && conversations.length === 0 && !selectedConversationPartner) {
     return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-neutral-100 font-sans p-4">
        <FiLoader className="animate-spin text-accent-purple text-5xl mb-4" />
        <p className="text-lg">Loading conversations...</p>
      </div>
    );
  }

  if (error && !isInitializingSession) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-neutral-100 font-sans p-6">
        <FiAlertCircle className="text-red-500 text-6xl mb-4" />
        <h2 className="text-2xl font-heading mb-2">Error Loading Chats</h2>
        <p className="text-neutral-400 text-center mb-6">{error}</p>
        <button 
            onClick={fetchConversations} 
            className="px-4 py-2 bg-accent-purple hover:bg-accent-purple-hover text-white rounded-md font-sans transition-colors"
        >
            Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col sm:flex-row bg-black text-neutral-100 overflow-hidden">
      <AnimatePresence>
        {(showSidebarOnMobile || (conversations.length === 0 && !selectedConversationPartner && !currentMatchId) ) && (
          <motion.div 
            key="sidebar"
            className="fixed inset-0 z-20 sm:static sm:z-auto sm:flex-shrink-0 w-full sm:w-auto"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <ChatSidebar
              conversations={conversations}
              selectedConversationId={currentMatchId} // Changed to currentMatchId for selection indication
              onSelectConversation={(matchId) => {
                const convo = conversations.find(c => c.id === matchId);
                if (convo) handleSelectConversation(matchId, convo.partnerId);
              }}
              currentUserId={currentUserId}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div 
        className={`flex-grow h-full transition-all duration-300 ${ (showSidebarOnMobile || (conversations.length === 0 && !selectedConversationPartner && !currentMatchId)) && 'hidden sm:flex'} flex flex-col`}
      >
        {(selectedConversationPartner && currentMatchId) || isLoadingMessages ? (
            <ChatView
                messages={messages}
                currentUserId={currentUserId}
                chatPartner={selectedConversationPartner}
                onSendMessage={handleSendMessage}
                isLoadingMessages={isLoadingMessages}
                isSendingMessage={isSendingMessage}
                onBack={() => setShowSidebarOnMobile(true)} 
            />
        ) : (
            !isLoadingConversations && conversations.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center bg-neutral-950 text-neutral-500 p-8">
                    <FiMessageSquare size={64} className="mb-4 text-neutral-700"/>
                    <p className="text-xl font-heading text-neutral-300">No conversations yet</p>
                    <p className="mt-1 text-sm">Start a new chat by finding a collaborator or from a user's profile.</p>
                    <Link href="/match" className="mt-4">
                        <button className="px-4 py-2 bg-accent-purple hover:bg-accent-purple-hover text-white rounded-md font-sans transition-colors">Find Collaborators</button>
                    </Link>
                </div>
            )
        )}
         {!selectedConversationPartner && !currentMatchId && !isLoadingConversations && conversations.length > 0 && (
             <div className="h-full flex flex-col items-center justify-center bg-neutral-950 text-neutral-500 p-8">
                <FiMessageSquare size={64} className="mb-4 text-neutral-700"/>
                <p className="text-xl font-heading text-neutral-300">Select a conversation</p>
                <p className="mt-1 text-sm">Choose a chat from the sidebar to start messaging.</p>
            </div>
        )}
      </div>
    </div>
  );
} 