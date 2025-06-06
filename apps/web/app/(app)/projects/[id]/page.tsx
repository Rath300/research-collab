'use client';

import { api } from '@/lib/trpc';
import { notFound } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { FiUser, FiLoader } from 'react-icons/fi';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import React, { useState } from 'react';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

// NOTE: We'll need to define this type based on what `listCollaborators` returns.
// This is an assumption based on the tRPC router.
type Collaborator = {
    id: string;
    role: string;
    status: string;
    user: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
    } | null;
}

const CollaboratorList = ({ projectId }: { projectId: string }) => {
    const { data: collaborators, isLoading, error } = api.project.listCollaborators.useQuery({ projectId });

    if (isLoading) return <div className="flex items-center text-neutral-400"><FiLoader className="animate-spin mr-2" />Loading collaborators...</div>;
    if (error) return <div className="text-red-500">Error loading collaborators: {error.message}</div>;
    if (!collaborators || collaborators.length === 0) return <p className="text-neutral-500">No collaborators yet.</p>;

    return (
        <div className="space-y-4">
            {collaborators.map((collab: Collaborator) => (
                <div 
                  key={collab.id} 
                  className={`flex items-center justify-between p-3 bg-neutral-800 rounded-lg transition-opacity ${
                    collab.status === 'pending' ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                    <div className="flex items-center">
                        <Avatar 
                            src={collab.user?.avatar_url} 
                            fallback={collab.status === 'pending' ? <FiLoader className="animate-spin" /> : <FiUser />}
                            alt={collab.user?.first_name || 'User'}
                            size="sm"
                        />
                        <div className="ml-4">
                            <p className="font-semibold text-white">{collab.user?.first_name} {collab.user?.last_name}</p>
                            <p className="text-sm text-neutral-400">{collab.status === 'pending' ? 'Sending invite...' : collab.user?.id}</p>
                        </div>
                    </div>
                    <Badge variant={collab.role === 'owner' ? 'primary' : 'secondary'}>{collab.status === 'pending' ? 'pending' : collab.role}</Badge>
                </div>
            ))}
        </div>
    );
}

const InviteCollaboratorForm = ({ projectId }: { projectId: string }) => {
    const [inviteeUserId, setInviteeUserId] = useState('');
    const utils = api.useUtils();
    const { profile } = useAuthStore(); // Get current user's profile for optimistic update

    const inviteMutation = api.project.inviteCollaborator.useMutation({
        onMutate: async (newInvite) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await utils.project.listCollaborators.cancel({ projectId });

            // Snapshot the previous value
            const previousCollaborators = utils.project.listCollaborators.getData({ projectId });

            // Optimistically update to the new value
            utils.project.listCollaborators.setData({ projectId }, (old) => {
                const optimisticCollaborator: Collaborator = {
                    id: `optimistic-${Date.now()}`, // Temporary unique ID
                    role: newInvite.role,
                    status: 'pending',
                    user: {
                        id: newInvite.inviteeUserId,
                        first_name: 'Pending',
                        last_name: 'Invitation',
                        avatar_url: null,
                    },
                };
                return old ? [...old, optimisticCollaborator] : [optimisticCollaborator];
            });

            setInviteeUserId('');
            // Return a context object with the snapshotted value
            return { previousCollaborators };
        },
        onError: (err, newInvite, context) => {
            // If the mutation fails, use the context we returned from onMutate to roll back
            if (context?.previousCollaborators) {
                utils.project.listCollaborators.setData({ projectId }, context.previousCollaborators);
            }
            // TODO: Show an error toast
            console.error('Failed to invite collaborator:', err);
        },
        onSettled: () => {
            // Always refetch after error or success to ensure data consistency
            utils.project.listCollaborators.invalidate({ projectId });
        },
    });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (inviteeUserId.trim() && profile) {
            inviteMutation.mutate({
                projectId,
                inviteeUserId: inviteeUserId.trim(),
                role: 'viewer',
            });
        }
    };

    return (
        <form onSubmit={handleInvite} className="flex items-center space-x-2">
            <Input
                type="text"
                placeholder="Enter User ID to invite"
                value={inviteeUserId}
                onChange={(e) => setInviteeUserId(e.target.value)}
                className="flex-grow"
                disabled={inviteMutation.isPending}
            />
            <Button type="submit" disabled={!inviteeUserId.trim() || inviteMutation.isPending}>
                {inviteMutation.isPending ? <FiLoader className="animate-spin" /> : 'Send Invite'}
            </Button>
        </form>
    );
};

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id: projectId } = params;

  // Fetch project details
  const { data: project, isLoading: isProjectLoading, error: projectError } = api.project.getById.useQuery({ id: projectId });

  // TODO: Fetch collaborators list
  // const { data: collaborators, isLoading: areCollaboratorsLoading } = api.project.listCollaborators.useQuery({ projectId });
  
  // TODO: Add mutation for inviting collaborators
  // const inviteMutation = api.project.inviteCollaborator.useMutation();

  if (isProjectLoading) {
    return <div className="p-8"><FiLoader className="animate-spin text-2xl" /></div>;
  }

  if (projectError) {
    return <div className="p-8 text-red-500">Error loading project: {projectError.message}</div>;
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8 text-white">
      <Card className="bg-neutral-900 border-neutral-800 mb-8">
        <CardHeader>
            <CardTitle className="text-3xl font-bold">{project.title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="mt-2 text-neutral-300">{project.content}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-neutral-900 border-neutral-800 mb-8">
        <CardHeader>
            <CardTitle className="text-2xl font-bold">Collaborators</CardTitle>
        </CardHeader>
        <CardContent>
            <CollaboratorList projectId={projectId} />
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
            <CardTitle className="text-2xl font-bold">Invite a Collaborator</CardTitle>
        </CardHeader>
        <CardContent>
            <InviteCollaboratorForm projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  );
}
