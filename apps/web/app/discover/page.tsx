'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { type ResearchPost, type Profile } from '@research-collab/db';
import { PageContainer } from '@/components/layout/PageContainer';
import { FiSearch, FiTrendingUp, FiClock, FiAlertCircle, FiLoader, FiUser } from 'react-icons/fi';
import { Avatar } from '@/components/ui/Avatar';

interface Project extends ResearchPost {
  profiles?: Partial<Profile> | null;
}

export default function DiscoverPage() {
  const supabase = getSupabaseClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'trending' | 'recent'>('trending');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('research_posts')
        .select(
          `
          *,
          profiles!user_id (
            first_name,
            last_name,
            institution,
            avatar_url
          )
        `
        )
        .eq('visibility', 'public')
        .limit(20);

      if (filter === 'trending') {
        query = query.order('engagement_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error: projectsError } = await query;

      if (projectsError) throw projectsError;
      setProjects((data as Project[] | null) || []);
    } catch (err) {
      console.error("Error loading projects:", err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [supabase, filter]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  if (loading) {
    return (
      <PageContainer title="Discover Projects" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-researchbee-yellow text-6xl mb-4" />
          <p className="text-xl text-gray-300">Loading projects...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl shadow-lg text-center">
          <FiAlertCircle className="mx-auto text-red-500 text-6xl mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Oops! Something went wrong.</h2>
          <p className="text-gray-300 mb-4">Error: {error}</p>
          <Button 
            onClick={loadProjects}
            variant="primary"
            className="bg-researchbee-yellow hover:bg-researchbee-darkyellow text-black"
          >
            Try Again
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Discover Projects" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white">
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        <div className="glass-card p-6 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <FiSearch className="text-3xl text-researchbee-yellow mr-3" />
            <h1 className="text-3xl font-semibold text-white">Discover Projects</h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant={filter === 'trending' ? 'primary' : 'outline'}
              onClick={() => setFilter('trending')}
              className={`${
                filter === 'trending' 
                  ? 'bg-researchbee-yellow text-black' 
                  : 'border-researchbee-yellow text-researchbee-yellow hover:bg-researchbee-yellow/10'
              } transition-all`}
            >
              <FiTrendingUp className="mr-2" /> Trending
            </Button>
            <Button
              variant={filter === 'recent' ? 'primary' : 'outline'}
              onClick={() => setFilter('recent')}
              className={`${
                filter === 'recent'
                  ? 'bg-researchbee-yellow text-black'
                  : 'border-researchbee-yellow text-researchbee-yellow hover:bg-researchbee-yellow/10'
              } transition-all`}
            >
              <FiClock className="mr-2" /> Recent
            </Button>
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <Link href={`/research/${project.id}`} key={project.id} className="block group">
                <div className="glass-card p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out flex flex-col justify-between h-full transform group-hover:-translate-y-1">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2 truncate group-hover:text-researchbee-yellow transition-colors" title={project.title}>
                      {project.title}
                    </h2>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-3" title={project.content || undefined}>
                      {project.content || 'No description available.'}
                    </p>
                    
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center mr-2 overflow-hidden flex-shrink-0">
                        <Avatar 
                          src={project.profiles?.avatar_url} 
                          alt={project.profiles?.first_name || 'User'} 
                          size="sm"
                          fallback={<FiUser className="h-4 w-4 text-researchbee-yellow" />}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white truncate">{`${project.profiles?.first_name || ''} ${project.profiles?.last_name || ''}`.trim() || 'Anonymous Researcher'}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {project.profiles?.institution || 'No Institution Provided'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {(project.tags || []).map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-researchbee-yellow/20 text-researchbee-yellow px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center text-xs text-gray-400">
                    <span>{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Date N/A'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card p-10 rounded-xl shadow-lg text-center col-span-full">
            <FiSearch className="mx-auto text-6xl text-gray-500 mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-3">No Projects Found</h2>
            <p className="text-gray-300 mb-6">
              {filter === 'trending' ? "There are no trending projects matching your criteria right now." : "No recent projects found. Check back later!"}
            </p>
            <Button
              variant="secondary"
              onClick={() => setFilter(filter === 'trending' ? 'recent' : 'trending')}
              className="bg-researchbee-yellow/20 hover:bg-researchbee-yellow/30 text-researchbee-yellow"
            >
              {filter === 'trending' ? 'View Recent Projects' : 'View Trending Projects'}
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
} 