"use client";

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from 'next/link';
import { FiCalendar, FiClock, FiUsers } from "react-icons/fi";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  collaborators_count: number;
  created_at: string;
}

interface ResearchListProps {
  userId: string;
}

export default function ResearchList({ userId }: ResearchListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

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

        // Using mock data for now
        const mockProjects: Project[] = [
          {
            id: '1',
            title: 'Quantum Computing Applications in Healthcare',
            description: 'Exploring how quantum computing can revolutionize medical diagnostics and treatment planning',
            status: 'In Progress',
            deadline: '2025-07-15',
            collaborators_count: 3,
            created_at: '2024-01-10',
          },
          {
            id: '2',
            title: 'Machine Learning for Climate Prediction',
            description: 'Using neural networks to improve long-term climate forecasting models',
            status: 'Planning',
            deadline: '2025-06-30',
            collaborators_count: 5,
            created_at: '2024-03-20',
          },
          {
            id: '3',
            title: 'Blockchain in Academic Publishing',
            description: 'Implementing blockchain technology to ensure research integrity and transparent peer review',
            status: 'Completed',
            deadline: '2024-12-01',
            collaborators_count: 2,
            created_at: '2024-02-05',
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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-700 text-white';
      case 'in progress':
        return 'bg-blue-700 text-white';
      case 'planning':
        return 'bg-yellow-600 text-black';
      case 'on hold':
        return 'bg-orange-700 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Link href={`/projects/${project.id}`} key={project.id}>
          <div className="netflix-card hover:border-researchbee-yellow transition-all">
            <div className="flex justify-between">
              <h3 className="text-xl font-bold">{project.title}</h3>
              <span className={`netflix-pill ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            
            <p className="text-researchbee-light-gray mt-2 line-clamp-2">
              {project.description}
            </p>
            
            <div className="flex justify-between mt-4 text-sm text-researchbee-light-gray">
              <span>Created: {formatDate(project.created_at)}</span>
              <span>{project.collaborators_count} collaborators</span>
              <span>Due: {getDaysRemaining(project.deadline)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 