"use client";

import React from 'react';
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  created_at: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch user profile data
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", user.id)
            .single();
            
          if (profile?.full_name) {
            setUserName(profile.full_name);
          } else {
            setUserName(user.email?.split("@")[0] || "Researcher");
          }
          
          // Fetch user's projects
          const { data: projectsData } = await supabase
            .from("research_projects")
            .select("*")
            .eq("creator_id", user.id);
            
          if (projectsData) {
            setProjects(projectsData as Project[]);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Research Collab</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {userName}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Your Projects</h2>
            <Link
              href="/research/new"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
            >
              Create New Project
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg text-gray-500">No projects yet</h3>
              <p className="mt-2 text-gray-400">
                Create your first research project to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-gray-600 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="mt-4">
                      <Link
                        href={`/research/${project.id}`}
                        className="text-primary hover:text-primary-dark"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 