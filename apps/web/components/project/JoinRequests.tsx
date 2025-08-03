'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { api } from '@/lib/trpc';
import { FiUser, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface JoinRequestsProps {
  projectId: string;
}

export function JoinRequests({ projectId }: JoinRequestsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  const { data: pendingRequests, refetch } = api.project.listPendingJoinRequests.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const respondToRequest = api.project.respondToJoinRequest.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleRespond = async (requesterId: string, action: 'accept' | 'decline') => {
    setIsLoading(requesterId);
    try {
      await respondToRequest.mutateAsync({
        projectId,
        requesterId,
        action,
      });
    } catch (error) {
      console.error('Error responding to join request:', error);
    } finally {
      setIsLoading(null);
    }
  };

  if (!pendingRequests || pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white border border-border-light shadow-sm">
      <CardHeader>
        <CardTitle className="text-text-primary text-lg font-heading flex items-center gap-2">
          <FiClock className="text-accent-primary" />
          Pending Join Requests ({pendingRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {pendingRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-3 bg-surface-primary rounded-lg border border-border-light"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {request.requester_profile?.avatar_url ? (
                      <img
                        src={request.requester_profile.avatar_url}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <FiUser className="w-5 h-5 text-text-secondary" />
                    )}
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">
                      {request.requester_profile?.first_name && request.requester_profile?.last_name
                        ? `${request.requester_profile.first_name} ${request.requester_profile.last_name}`
                        : 'Anonymous User'}
                    </p>
                    <p className="text-text-secondary text-sm">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRespond(request.user_id, 'accept')}
                    disabled={isLoading === request.user_id}
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-600 hover:bg-green-50 disabled:opacity-50"
                  >
                    {isLoading === request.user_id ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiCheck className="w-4 h-4" />
                    )}
                    Accept
                  </Button>
                  
                  <Button
                    onClick={() => handleRespond(request.user_id, 'decline')}
                    disabled={isLoading === request.user_id}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {isLoading === request.user_id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiX className="w-4 h-4" />
                    )}
                    Decline
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
} 