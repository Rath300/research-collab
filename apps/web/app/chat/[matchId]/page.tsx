'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { PageContainer } from '@/components/layout/PageContainer';
import { getProfile } from '@/lib/api'; 
import { type Profile as DbProfile } from '@research-collab/db'; // Corrected import for Profile type
import { FiLoader, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { getBrowserClient } from '@/lib/supabaseClient';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params?.matchId as string;

  const { user: currentUser, isLoading: authLoading } = useAuthStore();
  const [recipientProfile, setRecipientProfile] = useState<DbProfile | null>(null);
  const [loadingRecipient, setLoadingRecipient] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !currentUser || !matchId) return;

    const fetchRecipientProfile = async () => {
      setLoadingRecipient(true);
      setError(null);
      try {
        const supabase = getBrowserClient();
        // 1. Get the match details to find the other user's ID
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('user_id_1, user_id_2')
          .eq('id', matchId)
          .single();

        if (matchError || !matchData) {
          throw new Error(matchError?.message || 'Match not found.');
        }

        const recipientId = matchData.user_id_1 === currentUser.id 
          ? matchData.user_id_2 
          : matchData.user_id_1;
        
        if (!recipientId) {
            throw new Error('Could not determine recipient ID from match.');
        }

        // 2. Fetch the recipient's profile
        const profile = await getProfile(recipientId);
        if (profile) {
          setRecipientProfile(profile);
        } else {
          throw new Error('Recipient profile not found.');
        }
      } catch (err: any) {
        console.error('Error fetching recipient profile:', err);
        setError(err.message || 'Failed to load chat partner details.');
      }
      setLoadingRecipient(false);
    };

    fetchRecipientProfile();

  }, [matchId, currentUser, authLoading]);

  if (authLoading || loadingRecipient) {
    return (
      <PageContainer title="Loading Chat..." className="flex items-center justify-center min-h-screen">
        <FiLoader className="animate-spin text-researchbee-yellow text-5xl" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" className="flex flex-col items-center justify-center min-h-screen">
        <div className="glass-card p-8 rounded-xl shadow-lg text-center max-w-md">
          <FiAlertCircle className="mx-auto text-red-400 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Error Loading Chat</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button variant="outline" onClick={() => router.back()} className="border-researchbee-yellow text-researchbee-yellow hover:bg-researchbee-yellow/10">
            <FiArrowLeft className="mr-2" /> Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (!currentUser || !recipientProfile) {
    // This case should ideally be covered by error or loading states
    // but as a fallback or if user logs out during load:
    return (
        <PageContainer title="Chat Unavailable" className="flex flex-col items-center justify-center min-h-screen">
            <div className="glass-card p-8 rounded-xl shadow-lg text-center max-w-md">
                <FiAlertCircle className="mx-auto text-gray-500 text-5xl mb-4" />
                <h2 className="text-2xl font-semibold text-white">Chat Not Available</h2>
                <p className="text-gray-300 mb-6">Could not load chat details. Please try again or ensure you are logged in.</p>
                <Button variant="primary" onClick={() => router.push('/discover')} className="bg-researchbee-yellow hover:bg-researchbee-darkyellow text-black">
                    Back to Discover
                </Button>
            </div>
        </PageContainer>
    );
  }

  return (
    <PageContainer title={`Chat with ${recipientProfile.first_name || 'User'}`} className="h-screen flex flex-col">
      <ChatInterface 
        matchId={matchId}
        recipientId={recipientProfile.id}
        recipientName={`${recipientProfile.first_name || ''} ${recipientProfile.last_name || ''}`.trim() || 'Chat Partner'}
        recipientAvatar={recipientProfile.avatar_url || null}
      />
    </PageContainer>
  );
} 