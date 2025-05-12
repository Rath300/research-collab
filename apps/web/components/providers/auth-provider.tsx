'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabaseClient';
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
  const supabase = getSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    console.log('AuthProvider Effect: Setting up listener.');
    setLoading(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentPath = window.location.pathname; 
        console.log(`AuthProvider: onAuthStateChange event: ${event}, Path: ${currentPath}, Session: ${!!session}`);
        const currentUser = session?.user ?? null;
        
        // Update store immediately
        setUser(currentUser); 

        if (currentUser) {
          console.log('AuthProvider: User detected.');
          // Check for redirect BEFORE fetching profile
          if (isAuthPathClient(currentPath) && currentPath !== '/auth/check-email') {
            console.log(`AuthProvider: Redirecting from auth path ${currentPath} to /dashboard`);
            // setLoading(false); // No need to set loading false here, redirect happens
            router.replace('/dashboard'); 
            return; // Exit early
          }

          // If not redirecting, fetch profile (ensure store has user first)
          try {
            console.log('AuthProvider: Fetching profile...');
            const profileData = await getProfile(currentUser.id);
            setProfile(profileData);
             console.log('AuthProvider: Profile fetched.');
          } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null); 
          } finally {
             // Always set loading false after profile attempt or if no profile needed on this path
            setLoading(false); 
          }
        } else {
           console.log('AuthProvider: No user session.');
          setProfile(null); 
          setLoading(false); 
        }
      }
    );

    return () => {
      console.log('AuthProvider Effect: Cleaning up listener.');
      authListener.subscription?.unsubscribe();
    };
  }, [supabase, setUser, setProfile, setLoading, router]); // Added router back as dependency for the replace call

  return <>{children}</>;
} 