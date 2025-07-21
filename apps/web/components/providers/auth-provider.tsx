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

      // initializeAuth logic (previously a separate function, now inlined for clarity with isMounted)
      console.log('[AuthProvider] initializeAuth: START');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!isMounted) return;
        console.log(`[AuthProvider] initializeAuth: Explicit getSession complete. Session: ${session ? session.user.id : 'null'}`);

        if (sessionError) {
          console.error('[AuthProvider] initializeAuth: Error fetching session:', sessionError);
          useAuthStore.getState().clearAuth();
          console.log('[AuthProvider] initializeAuth: Cleared auth data due to session error.');
          return; // Exit initializeAuth part
        }

        const remoteUser = session?.user ?? null;
        const storeUser = useAuthStore.getState().user;

        if (JSON.stringify(remoteUser) !== JSON.stringify(storeUser)) {
          console.log('[AuthProvider] initializeAuth: Session user differs from store. Updating user to:', remoteUser ? remoteUser.id : 'null');
          setUser(remoteUser);
          setSession(session);
        } else {
          console.log('[AuthProvider] initializeAuth: Session user matches store user or both are null.');
        }

        const userForProfileFetch = remoteUser;
        if (userForProfileFetch) {
          console.log(`[AuthProvider] initializeAuth: User (ID: ${userForProfileFetch.id}) present. Fetching profile.`);
          try {
            const profileData = await getProfile(userForProfileFetch.id);
            if (!isMounted) return;
            console.log('[AuthProvider] initializeAuth: getProfile returned.');
            if (JSON.stringify(profileData) !== JSON.stringify(useAuthStore.getState().profile)) {
              setProfile(profileData);
            } else if (!useAuthStore.getState().hasAttemptedProfileFetch && profileData) {
               setHasAttemptedProfileFetch(true);
            } else if (!profileData && useAuthStore.getState().profile) {
              setProfile(null);
            }
          } catch (error) {
            if (!isMounted) return;
            console.error('[AuthProvider] initializeAuth: Error fetching profile:', error);
            setProfile(null);
          }
        } else {
          if (useAuthStore.getState().user) {
            useAuthStore.getState().clearAuth();
          } else {
            setLoading(false);
            setHasAttemptedProfileFetch(true);
          }
        }
      } catch (e) {
        if (!isMounted) return;
        console.error('[AuthProvider] initializeAuth: Critical error:', e);
        useAuthStore.getState().clearAuth();
      } finally {
        if (isMounted) {
          if (useAuthStore.getState().isLoading) {
        setLoading(false);
      }
          if (!useAuthStore.getState().hasAttemptedProfileFetch) {
            setHasAttemptedProfileFetch(true);
          }
          console.log('[AuthProvider] initializeAuth: END. isLoading:', useAuthStore.getState().isLoading, 'hasAttemptedProfileFetch:', useAuthStore.getState().hasAttemptedProfileFetch);
        }
      }
      // End of initializeAuth logic

      if (!isMounted) return;

      // Setup onAuthStateChange listener
      console.log('[AuthProvider] Setting up onAuthStateChange listener...');
      const { data: listenerData } = supabase.auth.onAuthStateChange(
      async (event, session) => {
          if (!isMounted) return;
          console.log('[AuthProvider] onAuthStateChange: Event:', event, 'Session:', session ? session.user.id : 'null');
          useAuthStore.getState().setLoading(true);
        
        const listenerUser = session?.user ?? null;
        const currentStoreUser = useAuthStore.getState().user;
          console.log('[AuthProvider] onAuthStateChange: Listener user:', listenerUser ? listenerUser.id : 'null', 'Store user:', currentStoreUser ? currentStoreUser.id : 'null');

        if (JSON.stringify(listenerUser) !== JSON.stringify(currentStoreUser)) {
          setUser(listenerUser);
          setSession(session);
        }

        if (listenerUser) {
            const storeProfile = useAuthStore.getState().profile;
            const listenerUserId = listenerUser.id;
            let shouldFetchProfile = false;
            let fetchReason = "";

            if (event === 'SIGNED_IN') { shouldFetchProfile = true; fetchReason = "User signed in."; }
            else if (event === 'USER_UPDATED') { shouldFetchProfile = true; fetchReason = "User data updated by Supabase."; }
            else if (!storeProfile) { shouldFetchProfile = true; fetchReason = "No profile in store."; }
            else if (storeProfile.id !== listenerUserId) { shouldFetchProfile = true; fetchReason = `Profile in store for different user.`; }
            else if (event === 'TOKEN_REFRESHED' && !useAuthStore.getState().hasAttemptedProfileFetch) {
                shouldFetchProfile = true; fetchReason = "Token refreshed, profile not yet fetched this session.";
            }

            if (shouldFetchProfile) {
              console.log(`[AuthProvider] onAuthStateChange: Fetching profile. Reason: ${fetchReason} User: ${listenerUserId}`);
              try {
                const profileData = await getProfile(listenerUserId);
                if (!isMounted) return;
                console.log('[AuthProvider] onAuthStateChange: getProfile returned.');
                if (JSON.stringify(profileData) !== JSON.stringify(useAuthStore.getState().profile)) {
              setProfile(profileData);
                } else if (!useAuthStore.getState().hasAttemptedProfileFetch && profileData) {
                  setHasAttemptedProfileFetch(true);
                } else if (!profileData && useAuthStore.getState().profile) {
                  setProfile(null);
                }
              } catch (error) {
                if (!isMounted) return;
                console.error('[AuthProvider] onAuthStateChange: Error fetching profile:', error);
            setProfile(null); 
              }
            } else {
              console.log(`[AuthProvider] onAuthStateChange: Profile fetch SKIPPED for event '${event}', user ${listenerUserId}.`);
              if (storeProfile && storeProfile.id === listenerUserId && !useAuthStore.getState().hasAttemptedProfileFetch) {
                setHasAttemptedProfileFetch(true);
              }
          }
        } else {
            useAuthStore.getState().clearAuth();
          }
          
          if (isMounted) {
            useAuthStore.getState().setLoading(false);
            console.log('[AuthProvider] onAuthStateChange: END. isLoading:', useAuthStore.getState().isLoading, 'hasAttemptedProfileFetch:', useAuthStore.getState().hasAttemptedProfileFetch);
          }
        }
      );
      if (listenerData) { // Ensure listenerData and its subscription property exist
        authListenerSubscription = listenerData.subscription;
      }
    };

    mainAuthSetup().catch(error => {
      console.error("[AuthProvider] Critical error in mainAuthSetup:", error);
      if(isMounted) {
        useAuthStore.getState().clearAuth(); // Fallback to clear auth and set loading states
      }
    });
    
    return () => {
      isMounted = false;
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      console.log('[AuthProvider] Effect CLEANUP. Unsubscribing from onAuthStateChange.');
      authListenerSubscription?.unsubscribe();
    };
  }, [setUser, setSession, setProfile, setLoading, setHasAttemptedProfileFetch]); // Removed `supabase` from dependency array as it's a stable singleton

  return <>{children}</>;
} 