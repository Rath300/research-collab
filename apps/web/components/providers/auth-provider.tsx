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
    console.log('[AuthProvider] Effect RUNNING. Initializing onAuthStateChange listener.');
    setLoading(true); // Set loading true at the start of the effect

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] onAuthStateChange FIRED.');
        console.log(`[AuthProvider] Event: ${event}`);
        console.log(`[AuthProvider] Session available: ${!!session}`);
        
        const currentUser = session?.user ?? null;
        console.log('[AuthProvider] Current session user (currentUser):', currentUser ? { id: currentUser.id, email: currentUser.email } : null);
        console.log('[AuthProvider] Zustand store user BEFORE update (storeUser):', storeUser ? { id: storeUser.id, email: storeUser.email } : null);

        // Update user in store only if it has actually changed
        // Comparing stringified versions is a simple way to check for value changes in the user object
        if (JSON.stringify(currentUser) !== JSON.stringify(storeUser)) {
          console.log('[AuthProvider] Detected change in user object. Updating Zustand store user.');
          setUser(currentUser);
        } else {
          console.log('[AuthProvider] No change detected in user object. Zustand store user not updated.');
        }

        if (currentUser) {
          console.log(`[AuthProvider] User detected (ID: ${currentUser.id}). Attempting to fetch profile.`);
          try {
            const profileData = await getProfile(currentUser.id);
            setProfile(profileData);
            console.log('[AuthProvider] Profile fetched successfully:', profileData ? { id: profileData.id, first_name: profileData.first_name, last_name: profileData.last_name } : null);
          } catch (error) {
            console.error('[AuthProvider] Error fetching profile:', error);
            setProfile(null); 
            console.log('[AuthProvider] Profile set to null due to fetch error.');
          }
        } else {
          console.log('[AuthProvider] No user session. Clearing profile in Zustand store.');
          setProfile(null); 
        }
        console.log('[AuthProvider] Setting loading to false.');
        setLoading(false); 
      }
    );
    
    // Initial setLoading(false) was removed here, as onAuthStateChange will fire upon initialization
    // and set loading state accordingly after the first auth check / profile fetch attempt.

    return () => {
      console.log('[AuthProvider] Effect CLEANUP. Unsubscribing from onAuthStateChange.');
      authListener.subscription?.unsubscribe();
    };
  }, [supabase, setUser, setProfile, setLoading, storeUser]); // storeUser added as dependency

  return <>{children}</>;
} 