'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { FiCheckCircle, FiXCircle, FiInbox, FiLoader, FiAlertCircle, FiUser } from 'react-icons/fi';
import { supabase } from '@/lib/supabaseClient';

interface MatchRequest {
  id: string;
  matcher_user_id: string;
  matchee_user_id: string;
  status: string;
  created_at: string;
  matcher_profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

const RequestCard = ({ request, onRespond, isSubmitting }: { request: MatchRequest, onRespond: (requestId: string, status: 'matched' | 'rejected') => void, isSubmitting: boolean }) => (
  <Card className="bg-neutral-800 border-neutral-700 shadow-lg overflow-hidden">
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-xl text-accent-purple mb-1">
            Request from: {request.matcher_profile?.first_name || ''} {request.matcher_profile?.last_name || 'User'}
          </CardTitle>
        </div>
        <Avatar
          src={request.matcher_profile?.avatar_url || undefined}
          alt={`${request.matcher_profile?.first_name || ''} ${request.matcher_profile?.last_name || 'User'}'s avatar`}
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
        <Button variant="outline" onClick={() => onRespond(request.id, 'rejected')} disabled={isSubmitting}>
          {isSubmitting ? <FiLoader className="animate-spin mr-2" /> : <FiXCircle className="mr-2" />}
          Decline
        </Button>
        <Button onClick={() => onRespond(request.id, 'matched')} disabled={isSubmitting} className="bg-green-600 hover:bg-green-500 text-white">
          {isSubmitting ? <FiLoader className="animate-spin mr-2" /> : <FiCheckCircle className="mr-2" />}
          Accept
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function MatchRequestsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Get all incoming match requests where the current user is the matchee and status is 'matched', but the matcher hasn't been reciprocated
      const { data, error: fetchError } = await supabase
        .from('profile_matches')
        .select('id, matcher_user_id, matchee_user_id, status, created_at, matcher_profile:profiles!profile_matches_matcher_user_id_fkey(id, first_name, last_name, avatar_url)')
        .eq('matchee_user_id', user.id)
        .eq('status', 'matched');
      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load match requests.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (user) fetchRequests();
  }, [user, fetchRequests]);

  const handleRespond = async (requestId: string, newStatus: 'matched' | 'rejected') => {
    setRespondingId(requestId);
    try {
      // Update the match status
      const { error: updateError } = await supabase
        .from('profile_matches')
        .update({ status: newStatus })
        .eq('id', requestId);
      if (updateError) throw updateError;
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: any) {
      setError(err.message || 'Failed to update match request.');
    } finally {
      setRespondingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <PageContainer title="Match Requests" className="flex items-center justify-center min-h-screen">
        <FiLoader className="animate-spin text-accent-purple text-5xl" />
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
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Match Requests" className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading text-neutral-100 mb-8 text-center sm:text-left">
        Incoming Match Requests
      </h1>

      {requests.length === 0 ? (
        <Card className="bg-neutral-800 border-neutral-700 py-12 text-center">
          <FiInbox className="text-6xl text-neutral-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-100">No Pending Requests</h3>
        </Card>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onRespond={handleRespond}
              isSubmitting={respondingId === request.id}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
} 