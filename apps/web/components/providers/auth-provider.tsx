'use client';

import { useEffect } from 'react';
// import { usePathname, useRouter } from 'next/navigation'; // useRouter and usePathname no longer needed here
import { supabase } from '@/lib/supabaseClient'; // Import the singleton instance
import { useAuthStore } from '@/lib/store';
import { getProfile } from '@/lib/api';
// import type { User } from '@supabase/supabase-js'; // User type not directly used

// Auth paths and isAuthPathClient are no longer needed here, will be handled by middleware
// const AUTH_PATHS = ['/login', '/signup', '/reset-password'];
// const isAuthPathClient = (currentPathname: string | null): boolean => {
//   if (!currentPathname) return false;
//   return AUTH_PATHS.includes(currentPathname) || currentPathname.startsWith('/auth');
// };

// Minor change timestamp: 2023-10-27T10:00:00Z

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    setUser,
    setSession,
    setProfile,
    setLoading,
    setHasAttemptedProfileFetch,
    // Get current state for checks if needed, though direct store reads are often better inside functions
    // user: storeUserSnapshot,
    // profile: storeProfileSnapshot,
  } = useAuthStore();
  // const router = useRouter(); // No longer needed
  // const pathname = usePathname(); // No longer needed

  useEffect(() => {
    let isMounted = true;
    let authListenerSubscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null = null;
    let fallbackTimeout: NodeJS.Timeout | null = null;
    
    const fetchSessionWithRetry = async (retries = 1) => {
      let session = await supabase.auth.getSession();
      if (!session.data.session && retries > 0) {
        await new Promise(res => setTimeout(res, 100));
        session = await supabase.auth.getSession();
      }
      return session.data.session;
    };

    const mainAuthSetup = async () => {
      if (!isMounted) return;

      // Fallback: after 2 seconds, force loading to false if still loading
      fallbackTimeout = setTimeout(() => {
        if (isMounted && useAuthStore.getState().isLoading) {
          setLoading(false);
          setHasAttemptedProfileFetch(true);
          console.warn('[AuthProvider] Fallback: Forced loading=false after timeout.');
        }
      }, 2000);

      if (!useAuthStore.persist.hasHydrated()) {
        console.log('[AuthProvider] Store not yet rehydrated. Waiting for rehydration...');
        await useAuthStore.persist.rehydrate();
        if (!isMounted) return; // Check again after await
        console.log('[AuthProvider] Store successfully rehydrated.');
      } else {
        console.log('[AuthProvider] Store was already rehydrated.');
      }

      // Always force profile fetch after rehydration
      console.log('[AuthProvider] initializeAuth: START');
      try {
        const session = await fetchSessionWithRetry(1);
        if (!isMounted) return;
        console.log(`[AuthProvider] initializeAuth: Explicit getSession complete. Session: ${session ? session.user.id : 'null'}`);

        if (session) {
          const remoteUser = session?.user ?? null;
          setUser(remoteUser);
          setSession(session);

          if (remoteUser) {
            try {
              const profileData = await getProfile(remoteUser.id);
              if (!isMounted) return;
              setProfile(profileData);
            } catch (error) {
              if (!isMounted) return;
              console.error('[AuthProvider] initializeAuth: Error fetching profile:', error);
              setProfile(null);
            }
          } else {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (e) {
        if (!isMounted) return;
        console.error('[AuthProvider] initializeAuth: Critical error:', e);
        useAuthStore.getState().clearAuth();
      } finally {
        if (isMounted) {
          setLoading(false);
          setHasAttemptedProfileFetch(true);
          console.log('[AuthProvider] initializeAuth: END. isLoading:', useAuthStore.getState().isLoading, 'hasAttemptedProfileFetch:', useAuthStore.getState().hasAttemptedProfileFetch);
        }
      }

      if (!isMounted) return;

      // Setup onAuthStateChange listener
      console.log('[AuthProvider] Setting up onAuthStateChange listener...');
      authListenerSubscription = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;
          console.log('[AuthProvider] onAuthStateChange: Event:', event, 'Session:', session ? session.user.id : 'null');
          setLoading(true);
          const listenerUser = session?.user ?? null;
          setUser(listenerUser);
          setSession(session);

          // Always force profile fetch on auth events
          if (listenerUser) {
            try {
              const profileData = await getProfile(listenerUser.id);
              if (!isMounted) return;
              setProfile(profileData);
            } catch (error) {
              if (!isMounted) return;
              console.error('[AuthProvider] onAuthStateChange: Error fetching profile:', error);
              setProfile(null);
            }
          } else {
            setProfile(null);
          }
          setLoading(false);
          setHasAttemptedProfileFetch(true);
          console.log('[AuthProvider] onAuthStateChange: END. isLoading:', useAuthStore.getState().isLoading, 'hasAttemptedProfileFetch:', useAuthStore.getState().hasAttemptedProfileFetch);
        }
      ).data.subscription;
    };

    mainAuthSetup().catch(error => {
      console.error("[AuthProvider] Critical error in mainAuthSetup:", error);
      if(isMounted) {
        useAuthStore.getState().clearAuth();
        setLoading(false);
        setHasAttemptedProfileFetch(true);
      }
    });
    
    return () => {
      isMounted = false;
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      console.log('[AuthProvider] Effect CLEANUP. Unsubscribing from onAuthStateChange.');
      authListenerSubscription?.unsubscribe();
    };
  }, [setUser, setSession, setProfile, setLoading, setHasAttemptedProfileFetch]);

  return <>{children}</>;
} 