"use client";

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PageContainer, Button } from "../../components";
import { FiPlus, FiSettings, FiUser, FiMessageSquare, FiStar, FiClock, FiGrid, FiFolder, FiUsers } from 'react-icons/fi';
import Link from 'next/link';

// Define types
interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'planning';
  collaborators: number;
  lastUpdated: string;
}

interface ResearchMatch {
  id: string;
  name: string;
  title: string;
  institution: string;
  matchScore: number;
  researchAreas: string[];
  profileImage?: string;
  isNew: boolean;
}

interface Message {
  id: string;
  sender: string;
  senderAvatar?: string;
  preview: string;
  unread: boolean;
  timestamp: string;
}

// Dashboard navigation sections
const DASHBOARD_SECTIONS = [
  { id: 'projects', label: 'Projects', icon: <FiFolder className="mr-3" /> },
  { id: 'matches', label: 'Matches', icon: <FiUsers className="mr-3" /> },
  { id: 'messages', label: 'Messages', icon: <FiMessageSquare className="mr-3" /> },
  { id: 'settings', label: 'Settings', icon: <FiSettings className="mr-3" /> }
];

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  
  // Mock data
  const [projects, setProjects] = useState<Project[]>([]);
  const [matches, setMatches] = useState<ResearchMatch[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  // Get user data on component mount
  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch user profile data from Supabase
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
            
          if (profile && profile.full_name) {
            setUserName(profile.full_name);
          } else {
            // Fallback to user email or default
            setUserName(user.email?.split('@')[0] || 'Researcher');
          }
          
          // Fetch real projects from Supabase
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id);
            
          if (projectsError) {
            console.error('Error fetching projects:', projectsError);
          } else {
            setProjects(projectsData || []);
          }
          
          // Fetch real matches from Supabase
          const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select(`
              id,
              profiles:matched_user_id (
                id,
                full_name,
                title,
                institution,
                research_areas,
                avatar_url
              ),
              match_score,
              created_at,
              is_new
            `)
            .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
            .order('created_at', { ascending: false });
            
          if (matchesError) {
            console.error('Error fetching matches:', matchesError);
          } else {
            // Transform the match data to fit our interface
            const formattedMatches = (matchesData || []).map(match => ({
              id: match.id,
              name: match.profiles ? match.profiles.full_name || 'Researcher' : 'Researcher',
              title: match.profiles ? match.profiles.title || '' : '',
              institution: match.profiles ? match.profiles.institution || '' : '',
              matchScore: match.match_score || 0,
              researchAreas: match.profiles ? match.profiles.research_areas || [] : [],
              profileImage: match.profiles ? match.profiles.avatar_url : undefined,
              isNew: match.is_new || false
            }));
            setMatches(formattedMatches);
          }
          
          // Fetch real messages from Supabase
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select(`
              id,
              sender_id,
              profiles:sender_id (full_name, avatar_url),
              content,
              read,
              created_at
            `)
            .eq('receiver_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (messagesError) {
            console.error('Error fetching messages:', messagesError);
          } else {
            // Transform the message data to fit our interface
            const formattedMessages = (messagesData || []).map(message => {
              // Format the timestamp
              const createdAt = new Date(message.created_at);
              const now = new Date();
              const diffInHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
              
              let timestamp;
              if (diffInHours < 1) {
                timestamp = 'Just now';
              } else if (diffInHours < 24) {
                timestamp = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
              } else {
                const diffInDays = Math.floor(diffInHours / 24);
                timestamp = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
              }
              
              return {
                id: message.id,
                sender: message.profiles ? message.profiles.full_name || 'Unknown User' : 'Unknown User',
                senderAvatar: message.profiles ? message.profiles.avatar_url : undefined,
                preview: message.content.substring(0, 60) + (message.content.length > 60 ? '...' : ''),
                unread: !message.read,
                timestamp
              };
            });
            setMessages(formattedMessages);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, [supabase]);
  
  // Placeholder data for demo purposes
  const hasProjects = projects.length > 0;
  const hasMatches = matches.length > 0;
  const hasMessages = messages.length > 0;

  return (
    <PageContainer title="Dashboard">
      <div className="flex flex-col md:flex-row h-full">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 bg-gray-900 p-4 rounded-lg mr-0 md:mr-4 mb-4 md:mb-0">
          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                    activeSection === 'overview' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <FiGrid className="mr-3" /> Overview
                </button>
              </li>
              
              {DASHBOARD_SECTIONS.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                      activeSection === section.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {section.icon} {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-grow bg-gray-900 rounded-lg p-6">
          {activeSection === 'overview' && (
            <DashboardOverview 
              hasProjects={projects.length > 0}
              hasMatches={matches.length > 0} 
              hasMessages={messages.length > 0}
              onCreateProject={() => setActiveSection('projects')}
              userName={userName}
              profile={profile}
            />
          )}
          
          {activeSection === 'projects' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Projects</h2>
              <div className="flex justify-between items-center mb-6">
                <p>Manage your existing projects or create new ones</p>
                <Link href="/projects/new">
                  <button className="bg-researchbee-yellow text-black px-4 py-2 rounded-md hover:bg-yellow-500">
                    Create New Project
                  </button>
                </Link>
              </div>
              {!hasProjects ? (
                <div className="text-center py-12 bg-gray-800 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No projects yet</h3>
                  <p className="text-gray-400 mb-4">Create your first project to start finding collaborators</p>
                  <Link href="/projects/new">
                    <button className="bg-researchbee-yellow text-black px-4 py-2 rounded-md hover:bg-yellow-500">
                      Create Your First Project
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(project => (
                    <div 
                      key={project.id} 
                      className="bg-researchbee-dark-gray rounded-lg p-4 relative hover:border-researchbee-yellow hover:border transition-all"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 rounded-full bg-researchbee-medium-gray flex items-center justify-center text-xl font-bold">
                          {project.title.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-researchbee-light-gray">{project.description}</p>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <FiClock className="text-researchbee-yellow mr-1" />
                          <span className="font-bold">{project.lastUpdated}</span>
                        </div>
                        <Link href={`/projects/${project.id}`} passHref>
                          <Button size="small" variant="outline">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeSection === 'matches' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Matches</h2>
              {!hasMatches ? (
                <div className="text-center py-12 bg-gray-800 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No matches yet</h3>
                  <p className="text-gray-400 mb-4">Explore potential collaborators to find your perfect match</p>
                  <Link href="/discover">
                    <button className="bg-researchbee-yellow text-black px-4 py-2 rounded-md hover:bg-yellow-500">
                      Discover People
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches.slice(0, 3).map(match => (
                    <div 
                      key={match.id} 
                      className="bg-researchbee-dark-gray rounded-lg p-4 relative hover:border-researchbee-yellow hover:border transition-all"
                    >
                      {match.isNew && (
                        <div className="absolute top-3 right-3 bg-researchbee-yellow text-black text-xs px-2 py-1 rounded-full">
                          New Match
                        </div>
                      )}
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 rounded-full bg-researchbee-medium-gray flex items-center justify-center text-xl font-bold">
                          {match.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold">{match.name}</h3>
                          <p className="text-sm text-researchbee-light-gray">{match.title}</p>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{match.institution}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {match.researchAreas.map(area => (
                          <span key={area} className="text-xs bg-researchbee-medium-gray px-2 py-1 rounded-full">
                            {area}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <FiStar className="text-researchbee-yellow mr-1" />
                          <span className="font-bold">{match.matchScore}%</span>
                          <span className="text-xs text-researchbee-light-gray ml-1">match</span>
                        </div>
                        <Button size="small" onPress={() => {}}>Connect</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeSection === 'messages' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Messages</h2>
              {!hasMessages ? (
                <div className="text-center py-12 bg-gray-800 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No messages yet</h3>
                  <p className="text-gray-400 mb-4">Connect with your matches to start a conversation</p>
                  <button 
                    onClick={() => setActiveSection('matches')}
                    className="bg-researchbee-yellow text-black px-4 py-2 rounded-md hover:bg-yellow-500"
                  >
                    View Matches
                  </button>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4">
                  {messages.map(message => (
                    <div 
                      key={message.id}
                      className={`p-4 hover:bg-researchbee-medium-gray transition-colors ${message.unread ? 'border-l-4 border-researchbee-yellow' : ''}`}
                    >
                      <div className="flex items-center">
                        <div className="mr-3 w-10 h-10 rounded-full bg-researchbee-medium-gray flex items-center justify-center font-bold">
                          {message.sender.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className={`font-medium ${message.unread ? 'text-white' : 'text-researchbee-light-gray'}`}>
                              {message.sender}
                            </h3>
                            <span className="text-xs text-researchbee-light-gray">
                              {message.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-researchbee-light-gray line-clamp-1">
                            {message.preview}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeSection === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Settings</h2>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4">Profile Settings</h3>
                  <Link href="/profile-setup">
                    <button className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600">
                      Edit Profile
                    </button>
                  </Link>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4">Account Settings</h3>
                  <button className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 mr-4">
                    Change Password
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                    Delete Account
                  </button>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-4">Notification Settings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="email-notifications" className="mr-2" />
                      <label htmlFor="email-notifications">Email Notifications</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="match-notifications" className="mr-2" />
                      <label htmlFor="match-notifications">Match Alerts</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="message-notifications" className="mr-2" />
                      <label htmlFor="message-notifications">Message Notifications</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function DashboardOverview({ 
  hasProjects, 
  hasMatches, 
  hasMessages,
  onCreateProject,
  userName,
  profile
}: { 
  hasProjects: boolean;
  hasMatches: boolean;
  hasMessages: boolean;
  onCreateProject: () => void;
  userName: string;
  profile: any;
}) {
  // Check if profile is complete
  const isProfileComplete = profile && 
    profile.first_name && 
    profile.last_name && 
    profile.bio && 
    profile.skills?.length > 0 && 
    profile.interests?.length > 0;

  return (
    <div>
      {/* Welcome Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          Welcome back, {userName}!
        </h2>
        <p className="text-gray-400">
          Here's what's happening in your research world.
        </p>
      </div>

      {/* Getting Started Section - Only show if profile is incomplete */}
      {!isProfileComplete && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-medium mb-2">Getting Started</h3>
          <p className="text-gray-400 mb-4">
            Welcome to Research Bee! Here are some steps to get started:
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-researchbee-yellow text-black rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">1</div>
              <div>
                <h4 className="font-medium">Complete your profile</h4>
                <p className="text-gray-400 text-sm">
                  Add your skills, interests, and what you're looking for
                </p>
                <Link href="/profile-setup" className="text-researchbee-yellow text-sm hover:underline mt-1 inline-block">
                  Edit Profile
                </Link>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-researchbee-yellow text-black rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">2</div>
              <div>
                <h4 className="font-medium">Create a project</h4>
                <p className="text-gray-400 text-sm">
                  Describe your project idea to attract collaborators
                </p>
                <button 
                  onClick={onCreateProject}
                  className="text-researchbee-yellow text-sm hover:underline mt-1 inline-block"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard 
          title="Projects" 
          count={hasProjects ? 3 : 0}
          icon="📁"
        />
        <DashboardCard 
          title="Matches" 
          count={hasMatches ? 5 : 0}
          icon="🤝"
        />
        <DashboardCard 
          title="Messages" 
          count={hasMessages ? 2 : 0}
          icon="💬"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-medium mb-4">Recent Activity</h3>
          {hasMatches || hasMessages ? (
            <div className="space-y-4">
              <div className="border-b border-gray-700 pb-3">
                <p className="text-sm text-gray-400">Yesterday</p>
                <p>You matched with John Doe</p>
              </div>
              <div className="border-b border-gray-700 pb-3">
                <p className="text-sm text-gray-400">3 days ago</p>
                <p>New message from Jane Smith</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No recent activity</p>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-medium mb-4">Upgrade to Pro</h3>
          <p className="text-gray-400 mb-4">
            Get access to premium features and unlimited projects
          </p>
          <Link href="/pricing">
            <button className="bg-researchbee-yellow text-black px-4 py-2 rounded-md hover:bg-yellow-500 w-full">
              View Pricing
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ 
  title, 
  count, 
  icon 
}: { 
  title: string; 
  count: number;
  icon: string;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-medium">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
}