'use client';

import { api } from '@/lib/trpc';
import { notFound } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { FiUser, FiLoader } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import React, { useState } from 'react';
import Link from 'next/link';
import { FileManager } from '@/components/project/FileManager';
import { ProjectChat } from '@/components/project/ProjectChat';
import { TaskManager } from '@/components/project/TaskManager';
import { ProjectNotes } from '@/components/project/ProjectNotes';

type Collaborator = NonNullable<ReturnType<typeof api.project.listCollaborators.useQuery>['data']>[number];

interface ProjectPageProps {
  params: {
    id: string;
  };
}

const CollaboratorList = ({ projectId }: { projectId: string }) => {
    const { data: collaborators, isLoading, error } = api.project.listCollaborators.useQuery({ projectId });

    if (isLoading) return <div className="flex items-center text-neutral-400"><FiLoader className="animate-spin mr-2" />Loading collaborators...</div>;
    if (error) return <div className="text-red-500">Error loading collaborators: {error.message}</div>;
    if (!collaborators || collaborators.length === 0) return <p className="text-neutral-500">No collaborators yet.</p>;

    return (
        <div className="space-y-4">
            {collaborators.map((collab: Collaborator) => {
                // Defensive check for collaborator data
                if (!collab || !collab.id) {
                    return null; // Skip invalid collaborators
                }
                
                return (
                    <div 
                      key={collab.id} 
                      className={`flex items-center justify-between p-3 bg-white border border-border-light rounded-lg transition-opacity ${
                        collab.status === 'pending' ? 'opacity-50' : 'opacity-100'
                      }`}
                    >
                        <div className="flex items-center">
                            <Avatar 
                                src={collab.user?.avatar_url || undefined} 
                                fallback={collab.status === 'pending' ? <FiLoader className="animate-spin" /> : <FiUser />}
                                alt={collab.user?.first_name || 'User'}
                                size="sm"
                            />
                            <div className="ml-4">
                                <p className="font-semibold text-text-primary">
                                    {collab.user?.first_name || 'Unknown'} {collab.user?.last_name || ''}
                                </p>
                                <p className="text-sm text-text-secondary">
                                    {collab.status === 'pending' ? 'Sending invite...' : (collab.user?.id || 'Unknown User')}
                                </p>
                            </div>
                        </div>
                        <div
                          className={`px-2.5 py-1 rounded-full ${
                            collab.role === 'owner' ? 'bg-text-secondary/10 text-text-secondary' : 'bg-text-secondary/5 text-text-secondary'
                          }`}
                        >
                          <span className="text-xs font-bold">
                            {collab.status === 'pending' ? 'PENDING' : (collab.role || 'UNKNOWN').toUpperCase()}
                          </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const InviteCollaboratorForm = ({ projectId }: { projectId: string }) => {
    const [inviteeUsername, setInviteeUsername] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const utils = api.useUtils();
    const { profile } = useAuthStore(); // Get current user's profile for optimistic update

    // Search for collaborators when typing
    const { data: suggestions, isLoading: isSearching } = api.project.searchCollaborators.useQuery(
        { 
            query: inviteeUsername, 
            excludeProjectId: projectId 
        },
        { 
            enabled: inviteeUsername.length >= 2,
            staleTime: 1000 * 60 * 5 // 5 minutes
        }
    );

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
                        id: 'pending',
                        first_name: 'Pending',
                        last_name: 'Invitation',
                        avatar_url: null,
                    },
                };
                return old ? [...old, optimisticCollaborator] : [optimisticCollaborator];
            });

            setInviteeUsername('');
            setShowSuggestions(false);
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
        if (inviteeUsername.trim() && profile) {
            inviteMutation.mutate({
                projectId,
                inviteeUsername: inviteeUsername.trim(),
                role: 'viewer',
            });
        }
    };

    const handleSuggestionClick = (username: string) => {
        setInviteeUsername(username);
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <form onSubmit={handleInvite} className="flex items-center space-x-2">
                <div className="flex-grow relative">
                    <Input
                        type="text"
                        placeholder="Enter email or name to invite (e.g., john@example.com or John Doe)"
                        value={inviteeUsername}
                        onChange={(e) => {
                            setInviteeUsername(e.target.value);
                            setShowSuggestions(e.target.value.length >= 2);
                        }}
                        onFocus={() => setShowSuggestions(inviteeUsername.length >= 2)}
                        className="w-full"
                        disabled={inviteMutation.isPending}
                    />
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                            {isSearching ? (
                                <div className="p-3 text-center text-neutral-400">
                                    <FiLoader className="animate-spin inline mr-2" />
                                    Searching...
                                </div>
                            ) : (
                                suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.id}
                                        type="button"
                                        onClick={() => handleSuggestionClick(suggestion.email || `${suggestion.first_name} ${suggestion.last_name}`.trim() || '')}
                                        className="w-full p-3 text-left hover:bg-neutral-700 border-b border-neutral-700 last:border-b-0 flex items-center space-x-3"
                                    >
                                        <div className="flex-shrink-0">
                                            {suggestion.avatar_url ? (
                                                <img
                                                    src={suggestion.avatar_url}
                                                    alt=""
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-neutral-600 flex items-center justify-center">
                                                    <FiUser className="w-4 h-4 text-neutral-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-neutral-200 truncate">
                                                {suggestion.email || `${suggestion.first_name} ${suggestion.last_name}`.trim() || 'Unknown'}
                                            </div>
                                            <div className="text-xs text-neutral-400 truncate">
                                                {suggestion.first_name} {suggestion.last_name}
                                                {suggestion.title && ` • ${suggestion.title}`}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <Button type="submit" disabled={!inviteeUsername.trim() || inviteMutation.isPending}>
                    {inviteMutation.isPending ? <FiLoader className="animate-spin" /> : 'Send Invite'}
                </Button>
            </form>
            
            {/* Click outside to close suggestions */}
            {showSuggestions && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowSuggestions(false)}
                />
            )}
        </div>
    );
};

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id: projectId } = params;

  // Fetch project details
  const { data: project, isLoading: isProjectLoading, error: projectError } = api.project.getById.useQuery({ id: projectId });
  
  // Fetch collaborators list for task assignments
  const { data: collaborators } = api.project.listCollaborators.useQuery({ projectId });

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
    <div className="p-4 md:p-8 text-text-primary">
      <Card className="bg-white border-border-light mb-8">
        <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-3xl font-bold">{project?.title || 'Loading...'}</CardTitle>
              {(project?.role === 'owner' || project?.role === 'editor') && (
                  <Link href={`/projects/${project.id}/edit`} passHref>
                      <Button variant="outline">Edit Project</Button>
                  </Link>
              )}
            </div>
        </CardHeader>
        <CardContent>
            <p className="mt-2 text-text-secondary">{project?.description || 'No description available'}</p>
        </CardContent>
      </Card>

      {(project?.role === 'owner' || project?.role === 'editor') && (
        <Card className="bg-white border-border-light mb-8">
          <CardHeader>
              <CardTitle className="text-2xl font-bold">Invite a Collaborator</CardTitle>
          </CardHeader>
          <CardContent>
              <InviteCollaboratorForm projectId={projectId} />
          </CardContent>
        </Card>
      )}
      
      <Card className="bg-white border-border-light mb-8">
        <CardHeader>
            <CardTitle className="text-2xl font-bold">Collaborators</CardTitle>
        </CardHeader>
        <CardContent>
            <CollaboratorList projectId={projectId} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ProjectChat projectId={projectId} />
        <FileManager projectId={projectId} userRole={project?.role || 'viewer'} />
      </div>

      <TaskManager 
        projectId={projectId} 
        userRole={project?.role || 'viewer'} 
        collaborators={collaborators || []} 
      />

      <div className="mt-8">
        <ProjectNotes projectId={projectId} userRole={project?.role || 'viewer'} />
      </div>
    </div>
  );
}
