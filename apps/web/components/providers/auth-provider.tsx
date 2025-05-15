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
  const { setUser, setProfile, setLoading, setHasAttemptedProfileFetch } = useAuthStore();
  const supabase = getBrowserClient();
  // const router = useRouter(); // No longer needed
  // const pathname = usePathname(); // No longer needed

  useEffect(() => {
    console.log('[AuthProvider] Effect RUNNING. Initializing...');
    
    const initializeAuth = async () => {
      console.log('[AuthProvider] initializeAuth: START');
      // setLoading(true); // isLoading is initially true from store
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log(`[AuthProvider] initializeAuth: Explicit getSession complete. Session available: ${!!session}`);
        if (sessionError) {
          console.error('[AuthProvider] initializeAuth: Error fetching initial session:', sessionError);
          useAuthStore.getState().clearAuth();
          console.log('[AuthProvider] initializeAuth: Session error. setLoading(false) and setHasAttemptedProfileFetch(true) call imminent.');
          setHasAttemptedProfileFetch(true);
          setLoading(false);
          console.log('[AuthProvider] initializeAuth: Session error. setLoading(false) and setHasAttemptedProfileFetch(true) CALLED.');
          return;
        }

        const initialUser = session?.user ?? null;
        const currentStoreUserForInit = useAuthStore.getState().user;
        if (JSON.stringify(initialUser) !== JSON.stringify(currentStoreUserForInit)) {
          console.log('[AuthProvider] initializeAuth: Updating user in store:', initialUser ? initialUser.id : 'null');
          setUser(initialUser);
        }

        if (initialUser) {
          console.log(`[AuthProvider] initializeAuth: User (ID: ${initialUser.id}). Attempting to fetch profile.`);
          try {
            console.log('[AuthProvider] initializeAuth: Calling getProfile...');
            const profileData = await getProfile(initialUser.id);
            console.log('[AuthProvider] initializeAuth: getProfile returned:', profileData);
            const currentStoreProfileForInit = useAuthStore.getState().profile;
            if (JSON.stringify(profileData) !== JSON.stringify(currentStoreProfileForInit)) {
              console.log('[AuthProvider] initializeAuth: Updating profile in store.');
              setProfile(profileData);
            }
            console.log('[AuthProvider] initializeAuth: Initial profile fetched successfully.');
          } catch (error) {
            console.error('[AuthProvider] initializeAuth: Error fetching initial profile:', error);
            setProfile(null);
          } finally {
            console.log('[AuthProvider] initializeAuth: Profile fetch attempt done. setLoading(false) and setHasAttemptedProfileFetch(true) call imminent.');
            setHasAttemptedProfileFetch(true);
            setLoading(false);
            console.log('[AuthProvider] initializeAuth: Profile fetch attempt done. setLoading(false) and setHasAttemptedProfileFetch(true) CALLED.');
          }
        } else {
          console.log('[AuthProvider] initializeAuth: No initial user. Clearing auth.');
          useAuthStore.getState().clearAuth();
          console.log('[AuthProvider] initializeAuth: No initial user. setLoading(false) and setHasAttemptedProfileFetch(true) call imminent.');
          setHasAttemptedProfileFetch(true);
          setLoading(false);
          console.log('[AuthProvider] initializeAuth: No initial user. setLoading(false) and setHasAttemptedProfileFetch(true) CALLED.');
        }
      } catch (e) {
        console.error('[AuthProvider] initializeAuth: Critical error:', e);
        useAuthStore.getState().clearAuth();
        console.log('[AuthProvider] initializeAuth: Critical error. setLoading(false) and setHasAttemptedProfileFetch(true) call imminent.');
        setHasAttemptedProfileFetch(true);
        setLoading(false);
        console.log('[AuthProvider] initializeAuth: Critical error. setLoading(false) and setHasAttemptedProfileFetch(true) CALLED.');
      }
      console.log('[AuthProvider] initializeAuth: END');
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] onAuthStateChange: START');
        console.log('[AuthProvider] onAuthStateChange: Setting isLoading to true.');
        setLoading(true); 
        console.log('[AuthProvider] onAuthStateChange: isLoading SET to true.');
        console.log(`[AuthProvider] Event: ${event}, Session available: ${!!session}`);
        
        const listenerUser = session?.user ?? null;
        const currentStoreUser = useAuthStore.getState().user;

        console.log('[AuthProvider] Listener session user (listenerUser):', listenerUser ? { id: listenerUser.id } : null);
        console.log('[AuthProvider] Zustand store user BEFORE listener update (currentStoreUser):', currentStoreUser ? { id: currentStoreUser.id } : null);

        if (JSON.stringify(listenerUser) !== JSON.stringify(currentStoreUser)) {
          console.log('[AuthProvider] Listener: Updating user in store:', listenerUser ? listenerUser.id : 'null');
          setUser(listenerUser);
        }

        if (listenerUser) {
          console.log(`[AuthProvider] Listener: User (ID: ${listenerUser.id}). Attempting to fetch profile.`);
          try {
            console.log('[AuthProvider] Listener: Calling getProfile...');
            const profileData = await getProfile(listenerUser.id);
            console.log('[AuthProvider] Listener: getProfile returned:', profileData);
            const currentStoreProfile = useAuthStore.getState().profile;
            if (JSON.stringify(profileData) !== JSON.stringify(currentStoreProfile)) {
              console.log('[AuthProvider] Listener: Updating profile in store.');
              setProfile(profileData);
            }
            console.log('[AuthProvider] Listener: Profile fetched/verified successfully.');
          } catch (error) {
            console.error('[AuthProvider] Listener: Error fetching profile:', error);
            setProfile(null); 
          } finally {
            console.log('[AuthProvider] Listener: Profile fetch attempt done. setLoading(false) and setHasAttemptedProfileFetch(true) call imminent.');
            setHasAttemptedProfileFetch(true);
            setLoading(false);
            console.log('[AuthProvider] Listener: Profile fetch attempt done. setLoading(false) and setHasAttemptedProfileFetch(true) CALLED.');
          }
        } else {
          console.log('[AuthProvider] Listener: No user/session or SIGNED_OUT. Clearing auth.');
          useAuthStore.getState().clearAuth();
          console.log('[AuthProvider] Listener: No user. setLoading(false) and setHasAttemptedProfileFetch(true) call imminent.');
          setHasAttemptedProfileFetch(true);
          setLoading(false);
          console.log('[AuthProvider] Listener: No user. setLoading(false) and setHasAttemptedProfileFetch(true) CALLED.');
        }
        console.log('[AuthProvider] onAuthStateChange: END');
      }
    );
    
    return () => {
      console.log('[AuthProvider] Effect CLEANUP. Unsubscribing from onAuthStateChange.');
      authListener.subscription?.unsubscribe();
    };
  }, [supabase, setUser, setProfile, setLoading, setHasAttemptedProfileFetch]);

  return <>{children}</>;
} 