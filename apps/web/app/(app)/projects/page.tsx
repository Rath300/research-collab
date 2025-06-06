'use client';

import { api } from '@/lib/trpc';
import Link from 'next/link';
import { FiLoader, FiChevronRight, FiBriefcase } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function ProjectsPage() {
  // Assuming a tRPC procedure `listMyProjects` exists to get all projects for the current user.
  // We may need to create this procedure if it doesn't exist.
  const { data: projects, isLoading, error } = api.project.listMyProjects.useQuery();

  if (isLoading) {
    return <div className="p-8"><FiLoader className="animate-spin text-2xl" /></div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading projects: {error.message}</div>;
  }

  return (
    <div className="p-4 md:p-8 text-white">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <FiBriefcase className="mr-3" /> My Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects && projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map(project => (
                <Link 
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <p className="text-sm text-neutral-400">
                            Role: {project.role} {/* Assuming the procedure returns the user's role */}
                        </p>
                    </div>
                    <FiChevronRight className="h-5 w-5 text-neutral-500" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">You are not a part of any projects yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
