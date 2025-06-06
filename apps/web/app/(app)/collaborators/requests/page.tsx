'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { FiCheckCircle, FiXCircle, FiInbox, FiLoader, FiAlertCircle, FiUser } from 'react-icons/fi';
import { api } from '@/lib/trpc';
import { type collaboratorMatchSchema } from '@research-collab/db';
import { type z } from 'zod';

type CollaborationRequest = z.infer<typeof collaboratorMatchSchema> & {
    requester_profile: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
    } | null;
    research_post: {
        id: string;
        title: string | null;
    } | null;
};

const RequestCard = ({ request, onRespond, isSubmitting }: { request: CollaborationRequest, onRespond: (requestId: string, status: 'matched' | 'rejected') => void, isSubmitting: boolean }) => (
    <Card className="bg-neutral-800 border-neutral-700 shadow-lg overflow-hidden">
        <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-xl text-accent-purple mb-1">
                      Request from: {request.requester_profile?.first_name || ''} {request.requester_profile?.last_name || 'User'}
                    </CardTitle>
                    <CardDescription className="text-neutral-400 text-sm">
                      Project: <span className="font-semibold text-neutral-200">{request.research_post?.title || 'General Collaboration'}</span>
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

export default function CollaboratorsRequestsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const utils = api.useUtils();

  const { data: requests, isLoading: requestsLoading, error } = api.collaboration.listRequests.useQuery(undefined, {
    enabled: !!user,
  });

  const respondMutation = api.collaboration.respondToRequest.useMutation({
    onMutate: async ({ requestId }) => {
      await utils.collaboration.listRequests.cancel();
      const previousRequests = utils.collaboration.listRequests.getData();

      utils.collaboration.listRequests.setData(undefined, (old) => 
        old?.filter((r) => r.id !== requestId)
      );

      return { previousRequests };
    },
    onError: (err, variables, context) => {
      if (context?.previousRequests) {
        utils.collaboration.listRequests.setData(undefined, context.previousRequests);
      }
      // TODO: Add a toast notification for the error
    },
    onSettled: () => {
      utils.collaboration.listRequests.invalidate();
    },
  });

  const handleRespond = (requestId: string, newStatus: 'matched' | 'rejected') => {
    respondMutation.mutate({ requestId, newStatus });
  };

  if (authLoading || requestsLoading) {
    return (
      <PageContainer title="Collaboration Requests" className="flex items-center justify-center min-h-screen">
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
            <p className="text-neutral-300">{error.message}</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Collaboration Requests" className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading text-neutral-100 mb-8 text-center sm:text-left">
        Collaboration Requests
      </h1>

      {!requests || requests.length === 0 ? (
        <Card className="bg-neutral-800 border-neutral-700 py-12 text-center">
          <FiInbox className="text-6xl text-neutral-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-100">No Pending Requests</h3>
        </Card>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <RequestCard 
              key={request.id} 
              request={request as CollaborationRequest} 
              onRespond={handleRespond}
              isSubmitting={respondMutation.isPending && respondMutation.variables?.requestId === request.id}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
