"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';
import { FiCalendar, FiClock, FiUsers } from "react-icons/fi";
import { type Database } from '@/lib/database.types';
type Project = Database['public']['Tables']['projects']['Row'];
import { getProjects } from '@/lib/posts';

interface ResearchListProps {
  userId: string;
}

export default function ResearchList({ userId }: ResearchListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // supabase is already imported as a singleton

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await getProjects(20, 0, userId);
        setProjects(projects);
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [userId]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (projects.length === 0) {
    return <div className="p-4 text-center">No projects found. Create your first project!</div>;
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (visibility: 'public' | 'private' | 'connections') => {
    switch (visibility) {
      case 'public':
        return 'bg-green-700 text-white';
      case 'private':
        return 'bg-red-700 text-white';
      case 'connections':
        return 'bg-blue-700 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Link href={`/projects/${project.id}`} key={project.id} className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold mb-2">{project.title}</h3>
          <p className="text-gray-800 mb-4">{project.description || 'No description available.'}</p>
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <FiCalendar className="mr-1" />
            {formatDate(project.created_at)}
            <span className="mx-1">•</span>
            <FiClock className="mr-1" />
            {project.duration}
          </div>
          <div className="flex flex-wrap gap-2">
            {(project.tags || []).filter((tag): tag is string => typeof tag === 'string' && tag !== null && tag !== undefined).map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}