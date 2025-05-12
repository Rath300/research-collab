'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import { getProfile } from '@/lib/api'; // Assuming getProfile is here
import type { User } from '@supabase/supabase-js';

// Define auth paths here as well for client-side check
const AUTH_PATHS = ['/login', '/signup', '/reset-password'];
// Updated isAuthPath to handle potential null pathname gracefully, though we will check for null before calling it.
const isAuthPathClient = (currentPathname: string | null): boolean => {
  if (!currentPathname) return false;
  return AUTH_PATHS.includes(currentPathname) || currentPathname.startsWith('/auth');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const supabase = getBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          try {
            const profileData = await getProfile(currentUser.id);
            setProfile(profileData);
            
            // REDIRECT LOGIC: If user is logged in and on an auth path, redirect to dashboard
            if (pathname && isAuthPathClient(pathname) && pathname !== '/auth/check-email') {
              console.log('AuthProvider: Redirecting logged-in user from auth path', pathname, 'to /dashboard');
              router.push('/dashboard');
            }

          } catch (error) {
            console.error('Error fetching profile in AuthProvider:', error);
            setProfile(null); 
          } finally {
            // Ensure loading is false even if profile fetch fails but user exists
             setLoading(false); 
          }
        } else {
          setProfile(null); 
          // If user is logged out, middleware handles redirecting from protected pages
          // No explicit redirect needed here unless there are specific client-side cases.
           setLoading(false); 
        }
      }
    );

    // Initial check - simplified as onAuthStateChange usually covers it.
    // We mainly need to ensure loading is set correctly initially.
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
         setLoading(false); // Set loading false if no initial session
      }
      // If session exists, onAuthStateChange will fire and handle user/profile/loading/redirect
    };

    checkInitialSession();


    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [supabase, setUser, setProfile, setLoading, router, pathname]);

  return <>{children}</>;
} 