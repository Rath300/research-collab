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
    console.log('AuthProvider Effect: Setting up listener.');
    setLoading(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentPath = window.location.pathname; // Get fresh pathname inside callback
        console.log(`AuthProvider: onAuthStateChange event: ${event}, Path: ${currentPath}, Session: ${!!session}`);
        const currentUser = session?.user ?? null;
        setUser(currentUser); 

        if (currentUser) {
          console.log('AuthProvider: User detected.');
          
          // MODIFIED REDIRECT LOGIC:
          // Redirect if:
          // 1. We are on an auth path (excluding check-email)
          // 2. AND (it's NOT the login page a SIGNED_IN event just happened on (handleLogin will do it))
          //    OR the event is something else (like INITIAL_SESSION, TOKEN_REFRESHED) and we found a session.
          const shouldAuthProviderRedirect = 
            isAuthPathClient(currentPath) && 
            currentPath !== '/auth/check-email' &&
            !(event === 'SIGNED_IN' && currentPath === '/login');

          if (shouldAuthProviderRedirect) {
            console.log(`AuthProvider: Redirecting from ${currentPath} to /dashboard (event: ${event})`);
            router.replace('/dashboard'); 
            setLoading(false); 
            return; 
          }

          // If not redirecting, fetch profile
          try {
            console.log('AuthProvider: Fetching profile...');
            const profileData = await getProfile(currentUser.id);
            setProfile(profileData);
             console.log('AuthProvider: Profile fetched.');
          } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null); 
          } finally {
            setLoading(false); 
          }
        } else {
           console.log('AuthProvider: No user session.');
          setProfile(null); 
          setLoading(false); 
        }
      }
    );

    // Removed explicit initial check, rely on onAuthStateChange firing initially

    return () => {
      console.log('AuthProvider Effect: Cleaning up listener.');
      authListener.subscription?.unsubscribe();
    };
    // Dependencies: only things that, if changed, require setting up the listener again.
  }, [supabase, setUser, setProfile, setLoading, pathname]); // Added pathname

  return <>{children}</>;
} 