"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';
import { FiCalendar, FiClock, FiUsers } from "react-icons/fi";
import { type ResearchPost as Project } from '@research-collab/db';

interface ResearchListProps {
  userId: string;
}

export default function ResearchList({ userId }: ResearchListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // supabase is already imported as a singleton

  useEffect(() => {
    const getProjects = async () => {
      try {
        // In a real application, you would fetch projects from Supabase
        // const { data, error } = await supabase
        //   .from('projects')
        //   .select('*')
        //   .eq('user_id', userId)
        //   .order('created_at', { ascending: false });
        
        // if (error) throw error;
        // setProjects(data || []);

        // Using mock data for now, updated to ResearchPost schema
        const mockProjects: Project[] = [
          {
            id: '1',
            title: 'Quantum Computing Applications in Healthcare',
            content: 'Exploring how quantum computing can revolutionize medical diagnostics and treatment planning',
            user_id: userId,
            visibility: 'public',
            is_boosted: false,
            engagement_count: 10,
            created_at: '2024-01-10T10:00:00Z',
            updated_at: '2024-01-10T10:00:00Z',
            tags: ['quantum', 'healthcare']
          },
          {
            id: '2',
            title: 'Machine Learning for Climate Prediction',
            content: 'Using neural networks to improve long-term climate forecasting models',
            user_id: userId,
            visibility: 'public',
            is_boosted: true,
            boost_end_date: '2024-12-31T23:59:59Z',
            engagement_count: 25,
            created_at: '2024-03-20T12:00:00Z',
            updated_at: '2024-03-22T14:30:00Z',
            tags: ['ml', 'climate']
          },
          {
            id: '3',
            title: 'Blockchain in Academic Publishing',
            content: 'Implementing blockchain technology to ensure research integrity and transparent peer review',
            user_id: userId,
            visibility: 'private',
            is_boosted: false,
            engagement_count: 5,
            created_at: '2024-02-05T09:00:00Z',
            updated_at: '2024-02-06T11:00:00Z',
            tags: ['blockchain', 'publishing']
          },
        ];

        setProjects(mockProjects);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("An error occurred while fetching projects.");
        setIsLoading(false);
      }
    };

    getProjects();
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
        <Link href={`/projects/${project.id}`