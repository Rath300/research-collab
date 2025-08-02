'use client';

import React from 'react';
import { api } from '@/lib/trpc';
import { PageContainer } from '@/components/layout/PageContainer';
import { FiLoader, FiPlusCircle, FiHome } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';

export default function MyProjectsPage() {
  const { isLoading: authLoading, session } = useAuthStore();
  const { data: projects, isLoading, error } = api.project.listMyProjects.useQuery(undefined, { enabled: !authLoading && !!session });

  return (
    <PageContainer title="My Projects">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">My Projects</h1>
        <Link href="/projects/new" passHref>
          <Button>
            <FiPlusCircle className="mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <FiLoader className="animate-spin text-accent-purple text-3xl" />
        </div>
      )}

      {error && <p className="text-red-500">Error: {error.message || 'Failed to load projects.'}</p>}

      {!isLoading && !error && projects && projects.length === 0 && (
        <Card className="bg-neutral-900 border-neutral-800 text-center">
            <CardHeader>
                <FiHome className="mx-auto text-4xl text-neutral-500" />
            </CardHeader>
            <CardContent>
                <CardTitle className="text-xl text-white">No projects yet</CardTitle>
                <CardDescription className="text-neutral-400 mt-2">
                    Get started by creating your first research project.
                </CardDescription>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`} passHref>
            <Card className="bg-white border-border-light hover:border-border-medium transition-colors cursor-pointer h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl text-text-primary">{project.title}</CardTitle>
                <div className="text-xs text-text-primary font-bold px-2 py-1 rounded-full bg-text-secondary/10 text-text-secondary w-min mt-2">{project.role?.toUpperCase() || ''}</div>
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-text-secondary/10 text-text-secondary px-2 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-text-secondary line-clamp-3">
                  {project.description || 'No description available.'}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
} 