import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Define types for data from Supabase
interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface ResearchPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  tags: string[] | null;
  profiles: Profile | null;
}

interface CollaboratorMatch {
  id: string;
  created_at: string;
  user_id: string;
  matched_user_id: string;
  profiles: Profile | null;
}

// Dashboard navigation sections
const DASHBOARD_SECTIONS = [
  { id: 'projects', label: 'Projects', icon: <FiFolder className="mr-3" /> },
  { id: 'matches', label: 'Matches', icon: <FiUsers className="mr-3" /> },
  { id: 'messages', label: 'Messages', icon: <FiMessageSquare className="mr-3" /> },
  { id: 'settings', label: 'Settings', icon: <FiSettings className="mr-3" /> }
];

// Dashboard page with server components
export default async function DashboardPage() {
  const cookieStore = cookies();
  
  // Create a Supabase client for server-side fetching
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Fetch recent research posts
  const { data: posts } = await supabase
    .from('research_posts')
    .select(`
      id, 
      title, 
      content,
      created_at,
      user_id,
      tags,
      profiles (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .match({ visibility: 'public' })
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch user data
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // Fetch pending collaboration matches
  const { data: pendingMatches } = userId 
    ? await supabase
        .from('collaborator_matches')
        .select(`
          id,
          created_at,
          user_id,
          matched_user_id,
          profiles!collaborator_matches_matched_user_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .match({ matched_user_id: userId, status: 'pending' })
    : { data: null };

  const typedPosts = posts as ResearchPost[] | null;
  const typedMatches = pendingMatches as CollaboratorMatch[] | null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Research Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Recent Research</h2>
            {typedPosts && typedPosts.length > 0 ? (
              <div className="space-y-4">
                {typedPosts.map((post) => (
                  <div key={post.id} className="border-b pb-4">
                    <Link href={`/research/${post.id}`} className="text-lg font-medium hover:text-blue-600">
                      {post.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      By {post.profiles?.first_name} {post.profiles?.last_name} • {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-2 line-clamp-2">{post.content}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No research posts found.</p>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Activity</h2>
            {userId ? (
              <div className="space-y-4">
                <Link href="/research/new" className="block bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Create New Research Post
                </Link>
              </div>
            ) : (
              <p className="text-gray-500">Please log in to see your activity.</p>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Collaboration Requests</h2>
            {typedMatches && typedMatches.length > 0 ? (
              <div className="space-y-4">
                {typedMatches.map((match) => (
                  <div key={match.id} className="flex items-center space-x-3 border-b pb-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      {match.profiles?.avatar_url ? (
                        <img 
                          src={match.profiles.avatar_url} 
                          alt={`${match.profiles.first_name} ${match.profiles.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-blue-500 text-white">
                          {match.profiles?.first_name?.[0] || '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {match.profiles?.first_name} {match.profiles?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(match.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-auto flex space-x-2">
                      <button className="bg-green-500 text-white px-2 py-1 rounded text-xs">Accept</button>
                      <button className="bg-red-500 text-white px-2 py-1 rounded text-xs">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pending collaboration requests.</p>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/research?tag=ai" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200">
                AI
              </Link>
              <Link href="/research?tag=machine-learning" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200">
                Machine Learning
              </Link>
              <Link href="/research?tag=blockchain" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200">
                Blockchain
              </Link>
              <Link href="/research?tag=climate" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200">
                Climate
              </Link>
              <Link href="/research?tag=bio-tech" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200">
                Bio-Tech
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardOverview({ 
  hasProjects, 
  hasMatches, 
  hasMessages,
  onCreateProject,
  userName
}: { 
  hasProjects: boolean;
  hasMatches: boolean;
  hasMessages: boolean;
  onCreateProject: () => void;
  userName: string;
}) {
  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  const greeting = getTimeBasedGreeting();
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{greeting}, {userName || 'Researcher'}</h2>
      <p className="text-researchbee-light-gray mb-6">Here's what's happening with your research</p>
      
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
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-medium mb-2">Getting Started</h3>
        <p className="text-gray-400 mb-4">
          Welcome to ItsMightHappen! Here are some steps to get started:
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
          
          <div className="flex items-start">
            <div className="bg-researchbee-yellow text-black rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">3</div>
            <div>
              <h4 className="font-medium">Discover potential collaborators</h4>
              <p className="text-gray-400 text-sm">
                Browse and match with people who share your interests
              </p>
              <Link href="/discover" className="text-researchbee-yellow text-sm hover:underline mt-1 inline-block">
                Discover People
              </Link>
            </div>
          </div>
        </div>
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