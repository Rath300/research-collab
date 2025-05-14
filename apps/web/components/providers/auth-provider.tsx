'use client';

import { useEffect } from 'react';
// import { usePathname, useRouter } from 'next/navigation'; // useRouter and usePathname no longer needed here
import { getBrowserClient } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import { getProfile } from '@/lib/api';
// import type { User } from '@supabase/supabase-js'; // User type not directly used

// Auth paths and isAuthPathClient are no longer needed here, will be handled by middleware
// const AUTH_PATHS = ['/login', '/signup', '/reset-password'];
// const isAuthPathClient = (currentPathname: string | null): boolean => {
//   if (!currentPathname) return false;
//   return AUTH_PATHS.includes(currentPathname) || currentPathname.startsWith('/auth');
// };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: storeUser, setUser, setProfile, setLoading } = useAuthStore(); // Reordered for consistency
  const supabase = getBrowserClient();
  // const router = useRouter(); // No longer needed
  // const pathname = usePathname(); // No longer needed

  useEffect(() => {
    console.log('AuthProvider Effect: Setting up listener.');
    setLoading(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // const currentPath = window.location.pathname; // Not needed for this provider's logic
        console.log(`AuthProvider: onAuthStateChange event: ${event}, Session: ${!!session}`);
        const currentUser = session?.user ?? null;
        
        // Only update user in store if it has actually changed
        if (JSON.stringify(currentUser) !== JSON.stringify(storeUser)) {
          setUser(currentUser);
        }

        if (currentUser) {
          console.log('AuthProvider: User detected, fetching profile...');
          // Redirection logic removed - will be handled by middleware
          try {
            const profileData = await getProfile(currentUser.id);
            setProfile(profileData);
            console.log('AuthProvider: Profile fetched.');
          } catch (error) {
            console.error('AuthProvider: Error fetching profile:', error);
            setProfile(null); 
          }
        } else {
          console.log('AuthProvider: No user session.');
          setProfile(null); 
        }
        setLoading(false); 
      }
    );

    return () => {
      console.log('AuthProvider Effect: Cleaning up listener.');
      authListener.subscription?.unsubscribe();
    };
  }, [supabase, setUser, setProfile, setLoading, storeUser]); // storeUser added as dependency

  return <>{children}</>;
} 