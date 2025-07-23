'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { type Database } from '@/lib/database.types';
import { PageContainer } from '@/components/layout/PageContainer'; // Assuming this exists and is styled for dark theme
import { Avatar } from '@/components/ui/Avatar';
import { FiLoader, FiAlertCircle, FiUser, FiTag, FiExternalLink, FiHome } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { getProjects } from '@/lib/posts';

type Project = Database['public']['Tables']['projects']['Row'];

type ProjectWithProfile = Project & { profiles?: any };

const HomeButton = () => (
  <Link href="/dashboard" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-sans text-sm mb-4">
    <FiHome className="h-5 w-5" /> Home
  </Link>
);

export default function ResearchPage() {
  // supabase is already imported as a singleton
  const [projects, setProjects] = useState<ProjectWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);
      if (projectsError) throw projectsError;
      setProjects((data as ProjectWithProfile[] | null) || []);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  if (loading) {
    return (
      <PageContainer title="Project Feed" className="bg-black min-h-screen text-neutral-100 flex items-center justify-center">
        <div className="flex flex-col items-center font-sans">
          <FiLoader className="animate-spin text-accent-purple text-6xl mb-4" />
          <p className="text-xl text-neutral-300">Loading project feed...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" className="bg-black min-h-screen text-neutral-100 flex items-center justify-center">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-8 text-center font-sans">
          <FiAlertCircle className="mx-auto text-red-500 text-6xl mb-4" />
          <h2 className="text-2xl font-heading text-neutral-100 mb-2">Oops! Something went wrong.</h2>
          <p className="text-neutral-300 mb-4">Error: {error}</p>
          <button 
            onClick={loadProjects}
            className="px-4 py-2 bg-accent-purple hover:bg-accent-purple-hover text-white font-sans rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Project Feed" className="bg-black min-h-screen text-neutral-100 font-sans">
      <div className="p-4 sm:p-6 md:p-8">
        <HomeButton />
        <h1 className="text-3xl md:text-4xl font-heading text-neutral-100 mb-8 text-center">Project Feed</h1>
        
        {projects.length > 0 ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {projects.map((project) => {
              const authorName = project.profiles?.full_name || project.profiles?.first_name || 'Anonymous';
              const postDate = project.created_at ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true }) : 'some time ago';
              const truncatedContent = project.description && project.description.length > 200 
                ? `${project.description.substring(0, 200)}...` 
                : project.description;

              return (
                <div key={project.id} className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:border-neutral-700">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center mb-3">
                        <Avatar 
                            src={project.profiles?.avatar_url || undefined} 
                            alt={authorName || 'Unknown Author'} 
                            size="md"
                            fallback={<FiUser className="text-accent-purple" />} 
                            className="mr-3"
                        />
                        <div>
                            <p className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">{authorName || 'Unknown Author'}</p>
                            <p className="text-xs text-neutral-500">{project.profiles?.institution || 'Independent Researcher'} • {postDate}</p>
          </div>
        </div>
        
                    <Link href={`/projects/${project.id}`} className="block mb-2">
                      <h2 className="text-xl lg:text-2xl font-heading text-neutral-100 hover:text-accent-purple transition-colors duration-150">
                        {project.title}
                      </h2>
                    </Link>
                    
                    {truncatedContent && (
                        <p className="text-neutral-400 text-sm mb-4 line-clamp-3">
                        {truncatedContent}
                        </p>
                    )}

                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-accent-purple/20 text-accent-purple px-2.5 py-1 rounded-full text-xs font-medium"
                          >
                            <FiTag className="inline mr-1 -mt-px"/> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-neutral-800/50 px-5 sm:px-6 py-3 border-t border-neutral-800">
                    <Link href={`/projects/${project.id}`} className="text-sm font-sans font-medium text-accent-purple hover:text-accent-purple-hover inline-flex items-center">
                        View Project <FiExternalLink className="ml-1.5 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiAlertCircle className="mx-auto text-6xl text-neutral-600 mb-4" />
            <h2 className="text-xl font-heading text-neutral-300 mb-2">No Project Posts Yet</h2>
            <p className="text-neutral-500 font-sans">Check back later or be the first to share your work!</p>
            {/* Optional: Add a link to create a new post if applicable */}
            {/* <Link href="/projects/new" className="mt-4 inline-block px-4 py-2 bg-accent-purple hover:bg-accent-purple-hover text-white font-sans rounded-md transition-colors">
              Create New Post
            </Link> */}
        </div>
        )}
      </div>
    </PageContainer>
  );
} 