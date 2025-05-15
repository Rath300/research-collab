'use client';

import { useEffect, useCallback } from 'react';
// import { usePathname, useRouter } from 'next/navigation'; // useRouter and usePathname no longer needed here
import { getBrowserClient } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import { getProfile } from '@/lib/api';
import type { User } from '@supabase/supabase-js';

// Auth paths and isAuthPathClient are no longer needed here, will be handled by middleware
// const AUTH_PATHS = ['/login', '/signup', '/reset-password'];
// const isAuthPathClient = (currentPathname: string | null): boolean => {
//   if (!currentPathname) return false;
//   return AUTH_PATHS.includes(currentPathname) || currentPathname.startsWith('/auth');
// };

// Minor change timestamp: 2023-10-27T10:00:00Z

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { 
    user: storeUser, 
    profile: storeProfile, 
    setUser, 
    setProfile, 
    setLoading, 
    setAuthError 
  } = useAuthStore();
  const supabase = getBrowserClient();
  // const router = useRouter(); // No longer needed
  // const pathname = usePathname(); // No longer needed

  const fetchAndSetProfile = useCallback(async (currentUser: User) => {
    console.log(`[AuthProvider] fetchAndSetProfile called for user (ID: ${currentUser.id}).`);
    // Ensure loading is true during fetch, but check if already loading to avoid redundant sets if called rapidly
    if (!useAuthStore.getState().isLoading) {
        setLoading(true);
    }
    try {
      const profileData = await getProfile(currentUser.id);
      setProfile(profileData);
      setAuthError(null); 
      console.log('[AuthProvider] Profile fetched successfully in fetchAndSetProfile:', profileData ? { id: profileData.id, first_name: profileData.first_name } : null);
    } catch (error) {
      console.error('[AuthProvider] Error fetching profile in fetchAndSetProfile:', error);
      setProfile(null);
      setAuthError('Failed to load your profile. Please try refreshing the page.');
      console.log('[AuthProvider] Profile set to null due to fetch error in fetchAndSetProfile.');
    } finally {
      // Only set loading to false if this instance of fetchAndSetProfile was the one to set it true
      // This is tricky; simpler to just set false, but onAuthStateChange will also set it.
      setLoading(false); 
    }
  }, [setProfile, setLoading, setAuthError]);

  useEffect(() => {
    console.log('[AuthProvider] Mount/Effect RUNNING. Initializing onAuthStateChange listener.');
    setLoading(true); 

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] onAuthStateChange FIRED.');
        console.log(`[AuthProvider] Event: ${event}, Session available: ${!!session}`);
        
        const sessionUser = session?.user ?? null;
        setUser(sessionUser); 

        if (sessionUser) {
          await fetchAndSetProfile(sessionUser);
        } else {
          setProfile(null);
          setAuthError(null);
          setLoading(false); 
          console.log('[AuthProvider] No user session. Cleared profile and authError. Loading set to false.');
        }
      }
    );

    // Initial check on mount
    // Ensures that if the store is out of sync with a valid session, it attempts to rectify.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        console.log('[AuthProvider] Initial getSession() on mount completed.');
        const currentStoreState = useAuthStore.getState();
        if (session?.user) {
            console.log('[AuthProvider] Initial getSession() found user:', session.user.id, 
                        '. Current store user:', currentStoreState.user?.id, 
                        ', Store profile:', currentStoreState.profile?.id);
            // If user in session is different from store, or if profile is missing with a valid user
            if (!currentStoreState.user || currentStoreState.user.id !== session.user.id || !currentStoreState.profile) {
                 console.log('[AuthProvider] Initial getSession() indicates potential stale state. Setting user and fetching profile.');
                 setUser(session.user); // Ensure user is set
                 await fetchAndSetProfile(session.user);
            } else {
                 console.log('[AuthProvider] Initial getSession() found user and profile seems consistent with store. Setting loading to false if not already handled.');
                 if (currentStoreState.isLoading) setLoading(false); 
            }
        } else {
             console.log('[AuthProvider] Initial getSession() found no active session. Ensuring store is clear and loading is false.');
             if (currentStoreState.user || currentStoreState.profile) {
                setProfile(null); // setUser(null) would have been called by onAuthStateChange if session truly ended
                setAuthError(null);
             }
             if (currentStoreState.isLoading) setLoading(false);
        }
    }).catch(error => {
        console.error("[AuthProvider] Error during initial getSession() on mount:", error);
        setAuthError("Could not verify session. Please refresh.");
        setLoading(false);
    });

    return () => {
      console.log('[AuthProvider] Effect CLEANUP. Unsubscribing from onAuthStateChange.');
      authListener.subscription?.unsubscribe();
    };
  }, [supabase, setUser, setProfile, setLoading, setAuthError, fetchAndSetProfile]); 
  // storeUser & storeProfile were removed from deps as their check is now inside getSession().then() via getState()
  // This prevents re-running the entire effect if only storeUser/storeProfile change due to this effect itself.

  return <>{children}</>;
} 