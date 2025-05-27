'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { FiCheckCircle, FiXCircle, FiInbox, FiLoader, FiAlertCircle, FiUser, FiBriefcase } from 'react-icons/fi';
import { type Profile, type ResearchPost } from '@research-collab/db';

interface CollaborationRequest {
  id: string; 
  user_id: string; 
  status: 'pending' | 'matched' | 'rejected'; 
  created_at: string;
  requester_profile?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null;
  research_post?: Pick<ResearchPost, 'id' | 'title'> | null; 
}

export default function CollaboratorsRequestsPage() {
  const router = useRouter();
  const supabase = getBrowserClient();
  const { user, isLoading: authLoading } = useAuthStore();

  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<{[requestId: string]: boolean}>({});


  const fetchRequests = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from('collaborator_matches')
        .select(`
          id,
          user_id,
          status,
          created_at,
          requester_profile:profiles!collaborator_matches_user_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .eq('target_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (matchesError) {
        console.error("Supabase error fetching requests:", matchesError);
        throw matchesError;
      }
      
      if (matchesData) {
        const formattedRequests = matchesData.map(match => {
          // Ensure match and match.requester_profile are not null before accessing properties
          const profileData = match.requester_profile && Array.isArray(match.requester_profile) && match.requester_profile.length > 0 
            ? match.requester_profile[0] 
            : match.requester_profile; // if it's an object directly

          return {
            id: match.id,
            user_id: match.user_id,
            status: match.status as 'pending' | 'matched' | 'rejected',
            created_at: match.created_at,
            // Ensure profileData is used safely
            requester_profile: profileData ? {
              id: profileData.id,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              avatar_url: profileData.avatar_url,
            } : null,
            research_post: undefined, 
          };
        }) as CollaborationRequest[];
        setRequests(formattedRequests);
      } else {
        setRequests([]);
      }

    } catch (err: any) {
      console.error("Error fetching collaboration requests:", err);
      setError(err.message || 'Failed to load collaboration requests.');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    } else if (user) {
      fetchRequests();
    }
  }, [user, authLoading, router, fetchRequests]);

  const handleUpdateRequestStatus = async (requestId: string, newStatus: 'matched' | 'rejected') => {
    if (!user) {
      setError('You must be logged in to manage requests.');
      return;
    }
    
    setIsSubmitting(prev => ({...prev, [requestId]: true}));
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('collaborator_matches')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(), 
        })
        .eq('id', requestId)
        .eq('target_user_id', user.id);

      if (updateError) {
        throw updateError;
      }
      
      setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));

    } catch (err: any) {
      console.error(`Error updating request ${requestId} to ${newStatus}:`, err);
      setError(err.message || `Failed to update request.`);
    } finally {
      setIsSubmitting(prev => ({...prev, [requestId]: false}));
    }
  };
  
  if (authLoading || isLoading) {
    return (
      <PageContainer title="Collaboration Requests" className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiLoader className="animate-spin text-accent-purple text-5xl mx-auto mb-4" />
          <p className="text-xl text-neutral-400">Loading collaboration requests...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md bg-neutral-800 border-red-700">
          <CardHeader>
            <CardTitle className="flex items-center text-red-400">
              <FiAlertCircle className="mr-2" /> Error Loading Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-300">{error}</p>
            <Button onClick={fetchRequests} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Collaboration Requests" className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading text-neutral-100 mb-2 text-center sm:text-left">
        Collaboration Requests
      </h1>
      <p className="text-neutral-400 mb-8 text-center sm:text-left">
        Review and respond to users who want to collaborate on your projects.
      </p>

      {requests.length === 0 ? (
        <Card className="bg-neutral-800 border-neutral-700 py-12">
          <CardContent className="text-center">
            <FiInbox className="text-6xl text-neutral-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-100 mb-2">No Pending Requests</h3>
            <p className="text-neutral-400">You currently have no pending collaboration requests.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <Card key={request.id} className="bg-neutral-800 border-neutral-700 shadow-lg overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl text-accent-purple mb-1">
                          Request from: {request.requester_profile?.first_name || ''} {request.requester_profile?.last_name || 'User'}
                        </CardTitle>
                        <CardDescription className="text-neutral-400 text-sm">
                          {/* Project: <span className="font-semibold text-neutral-200">{request.research_post?.title || 'N/A'}</span> */}
                          Requested Collaboration (General)
                        </CardDescription>
                    </div>
                    <Avatar
                        src={request.requester_profile?.avatar_url || undefined}
                        alt={`${request.requester_profile?.first_name || ''} ${request.requester_profile?.last_name || 'User'}'s avatar`}
                        fallback={<FiUser className="w-5 h-5 text-neutral-400" />}
                        className="w-12 h-12 border-2 border-neutral-600"
                    />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-400 text-xs mb-4">
                  Received: {new Date(request.created_at).toLocaleDateString()}
                </p>
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-700/50">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateRequestStatus(request.id, 'rejected')}
                    disabled={isSubmitting[request.id]}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500/80 hover:text-red-300"
                  >
                    {isSubmitting[request.id] ? <FiLoader className="animate-spin mr-2" /> : <FiXCircle className="mr-2" />}
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleUpdateRequestStatus(request.id, 'matched')}
                    disabled={isSubmitting[request.id]}
                    className="bg-green-600 hover:bg-green-500 text-white"
                  >
                     {isSubmitting[request.id] ? <FiLoader className="animate-spin mr-2" /> : <FiCheckCircle className="mr-2" />}
                    Accept
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
