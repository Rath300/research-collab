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

// Minor change timestamp: 2023-10-27T10:00:00Z

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    setUser,
    setProfile,
    setLoading,
    setHasAttemptedProfileFetch,
    // Get current state for checks if needed, though direct store reads are often better inside functions
    // user: storeUserSnapshot,
    // profile: storeProfileSnapshot,
  } = useAuthStore();
  const supabase = getBrowserClient();
  // const router = useRouter(); // No longer needed
  // const pathname = usePathname(); // No longer needed

  useEffect(() => {
    console.log('[AuthProvider] Effect RUNNING. Initializing with persisted store awareness...');

    const initializeAuth = async () => {
      console.log('[AuthProvider] initializeAuth: START');
      // setLoading(true); // Zustand initial state for isLoading is true.
                       // AuthProvider's job is to set it to false when done.

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log(`[AuthProvider] initializeAuth: Explicit getSession complete. Session: ${session ? session.user.id : 'null'}`);

        if (sessionError) {
          console.error('[AuthProvider] initializeAuth: Error fetching session:', sessionError);
          // If session fetch fails, clear any potentially stale auth data from persisted store.
          useAuthStore.getState().clearAuth(); // This sets isLoading: false, hasAttemptedProfileFetch: true
          console.log('[AuthProvider] initializeAuth: Cleared auth data due to session error.');
          return;
        }

        const remoteUser = session?.user ?? null;
        const storeUser = useAuthStore.getState().user;

        // Update user in store only if it's different from the fresh session data.
        if (JSON.stringify(remoteUser) !== JSON.stringify(storeUser)) {
          console.log('[AuthProvider] initializeAuth: Session user differs from store. Updating user in store to:', remoteUser ? remoteUser.id : 'null');
          setUser(remoteUser); // This might trigger onAuthStateChange too, which is fine.
        } else {
          console.log('[AuthProvider] initializeAuth: Session user matches store user or both are null.');
        }
        
        // Determine the user to fetch profile for: prefer fresh session user.
        const userForProfileFetch = remoteUser; 

        if (userForProfileFetch) {
          console.log(`[AuthProvider] initializeAuth: User (ID: ${userForProfileFetch.id}) present. Fetching/validating profile.`);
          // setLoading(true) should still be active from initial store state.
          try {
            const profileData = await getProfile(userForProfileFetch.id);
            console.log('[AuthProvider] initializeAuth: getProfile returned.'); // Avoid logging full profileData for brevity/PII

            // Update profile in store if different from current, or if not yet fetched for this session.
            if (JSON.stringify(profileData) !== JSON.stringify(useAuthStore.getState().profile)) {
              console.log('[AuthProvider] initializeAuth: Updating profile in store.');
              setProfile(profileData); // This now also sets hasAttemptedProfileFetch: true
            } else if (!useAuthStore.getState().hasAttemptedProfileFetch && profileData) {
               // Profile is same as rehydrated but fetch wasn't marked, so mark it.
               console.log('[AuthProvider] initializeAuth: Profile same as rehydrated, ensuring hasAttemptedProfileFetch is true.');
               setHasAttemptedProfileFetch(true);
            } else if (!profileData && useAuthStore.getState().profile) {
              // Fresh fetch says no profile, but store had one (stale). Clear it.
              console.log('[AuthProvider] initializeAuth: Fresh fetch found no profile, clearing stale profile from store.');
              setProfile(null); // Clears profile, marks fetch attempt.
            }
            // If profileData is null and store.profile is also null, setProfile(null) handles it.
            
            console.log('[AuthProvider] initializeAuth: Profile fetch/validation successful.');
          } catch (error) {
            console.error('[AuthProvider] initializeAuth: Error fetching/validating profile:', error);
            // If profile fetch fails for a valid session user, clear profile from store.
            // Ensure isLoading is false and fetch attempt is marked.
            setProfile(null); // Clears profile, marks fetch attempt as true.
          }
        } else { // No user from session (remoteUser is null)
          console.log('[AuthProvider] initializeAuth: No active session user. Clearing auth state if necessary.');
          // If store still has a user (stale persisted data), clear it.
          if (useAuthStore.getState().user) {
            useAuthStore.getState().clearAuth(); // isLoading: false, hasAttemptedProfileFetch: true
          } else {
            // No session user, no store user. Just ensure loading flags are correct.
            setLoading(false);
            setHasAttemptedProfileFetch(true);
          }
        }
      } catch (e) {
        console.error('[AuthProvider] initializeAuth: Critical error during initialization:', e);
        useAuthStore.getState().clearAuth(); // Sets isLoading: false, hasAttemptedProfileFetch: true
      } finally {
        // Final check to ensure loading is false after all init logic.
        if (useAuthStore.getState().isLoading) {
          console.log('[AuthProvider] initializeAuth: Final setLoading(false) call.');
          setLoading(false);
        }
        // Ensure hasAttemptedProfileFetch is true if somehow missed (should be set by setProfile/clearAuth)
        if (!useAuthStore.getState().hasAttemptedProfileFetch) {
            setHasAttemptedProfileFetch(true);
        }
        console.log('[AuthProvider] initializeAuth: END. isLoading:', useAuthStore.getState().isLoading, 'hasAttemptedProfileFetch:', useAuthStore.getState().hasAttemptedProfileFetch);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] onAuthStateChange: Event:', event, 'Session:', session ? session.user.id : 'null');
        useAuthStore.getState().setLoading(true); 

        const listenerUser = session?.user ?? null;
        const currentStoreUser = useAuthStore.getState().user;

        console.log('[AuthProvider] onAuthStateChange: Listener user:', listenerUser ? listenerUser.id : 'null', 'Store user:', currentStoreUser ? currentStoreUser.id : 'null');

        if (JSON.stringify(listenerUser) !== JSON.stringify(currentStoreUser)) {
          console.log('[AuthProvider] onAuthStateChange: Updating user in store to:', listenerUser ? listenerUser.id : 'null');
          setUser(listenerUser);
        }

        if (listenerUser) {
          const storeProfile = useAuthStore.getState().profile;
          // Ensure we use the user ID from the listenerUser for consistency in this block.
          const listenerUserId = listenerUser.id;

          let shouldFetchProfile = false;
          let fetchReason = "";

          if (event === 'SIGNED_IN') {
            shouldFetchProfile = true;
            fetchReason = "User signed in.";
          } else if (event === 'USER_UPDATED') {
            shouldFetchProfile = true;
            fetchReason = "User data updated by Supabase.";
          } else if (!storeProfile) {
            shouldFetchProfile = true;
            fetchReason = "No profile in store for current user.";
          } else if (storeProfile.id !== listenerUserId) {
            shouldFetchProfile = true;
            fetchReason = `Profile in store (id: ${storeProfile.id}) belongs to a different user (id: ${listenerUserId}).`;
          } else if (event === 'TOKEN_REFRESHED' && !useAuthStore.getState().hasAttemptedProfileFetch) {
            // If token refreshed, but profile fetch hasn't been successfully completed for this user session yet.
            shouldFetchProfile = true;
            fetchReason = "Token refreshed, and profile not yet successfully fetched in this session.";
          }
          // For TOKEN_REFRESHED: if none of the above, and a profile for listenerUserId exists
          // and hasAttemptedProfileFetch is true, we skip re-fetching.

          if (shouldFetchProfile) {
            console.log(`[AuthProvider] onAuthStateChange: Fetching profile. Reason: ${fetchReason} User: ${listenerUserId}`);
            try {
              const profileData = await getProfile(listenerUserId);
              console.log('[AuthProvider] onAuthStateChange: getProfile returned.');
              
              if (JSON.stringify(profileData) !== JSON.stringify(useAuthStore.getState().profile)) {
                  console.log('[AuthProvider] onAuthStateChange: Updating profile in store.');
                  setProfile(profileData); 
              } else if (!useAuthStore.getState().hasAttemptedProfileFetch && profileData){
                  console.log('[AuthProvider] onAuthStateChange: Profile same as store, ensuring hasAttemptedProfileFetch is true.');
                  setHasAttemptedProfileFetch(true);
              } else if (!profileData && useAuthStore.getState().profile) {
                  console.log('[AuthProvider] onAuthStateChange: Fresh fetch found no profile, clearing stale profile from store.');
                  setProfile(null);
              }
              console.log('[AuthProvider] onAuthStateChange: Profile fetch/re-validation process complete.');
            } catch (error) {
              console.error('[AuthProvider] onAuthStateChange: Error fetching profile:', error);
              setProfile(null); 
            }
          } else {
            console.log(`[AuthProvider] onAuthStateChange: Profile fetch SKIPPED for event '${event}', user ${listenerUserId}.`);
            // If fetch was skipped, but profile exists and hasAttemptedProfileFetch is somehow false, ensure it's true.
            if (storeProfile && storeProfile.id === listenerUserId && !useAuthStore.getState().hasAttemptedProfileFetch) {
                console.log('[AuthProvider] onAuthStateChange: Marking hasAttemptedProfileFetch true for existing profile after skipped fetch.');
                setHasAttemptedProfileFetch(true);
            }
          }
        } else { 
          console.log('[AuthProvider] onAuthStateChange: No listener user (e.g. SIGNED_OUT). Clearing auth state.');
          useAuthStore.getState().clearAuth();
        }
        
        useAuthStore.getState().setLoading(false);
        console.log('[AuthProvider] onAuthStateChange: END. isLoading:', useAuthStore.getState().isLoading, 'hasAttemptedProfileFetch:', useAuthStore.getState().hasAttemptedProfileFetch);
      }
    );
    
    return () => {
      console.log('[AuthProvider] Effect CLEANUP. Unsubscribing from onAuthStateChange.');
      authListener.subscription?.unsubscribe();
    };
  // Reduce dependencies: supabase object itself rarely changes. Actions from useAuthStore are stable.
  // }, [supabase, setUser, setProfile, setLoading, setHasAttemptedProfileFetch]);
  }, [supabase]); // Key dependencies are supabase client and the dispatchers from store.
                   // Dispatchers from Zustand are stable, so supabase is main external dep.

  return <>{children}</>;
} 