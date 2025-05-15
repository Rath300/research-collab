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
  const { setUser, setProfile, setLoading } = useAuthStore();
  const supabase = getBrowserClient();
  // const router = useRouter(); // No longer needed
  // const pathname = usePathname(); // No longer needed

  useEffect(() => {
    console.log('[AuthProvider] Effect RUNNING. Initializing...');
    
    const initializeAuth = async () => {
      console.log('[AuthProvider] Initializing auth: explicitly fetching session and profile.');
      // setLoading(true); // setLoading(true) is called once before both initializeAuth and listener setup
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log(`[AuthProvider] Explicit getSession complete. Session available: ${!!session}`);
        if (sessionError) {
          console.error('[AuthProvider] Error fetching initial session:', sessionError);
          useAuthStore.getState().clearAuth(); // Use clearAuth
          setLoading(false); // Okay to set loading false here as it's an error state
          return;
        }

        const initialUser = session?.user ?? null;
        const currentStoreUserForInit = useAuthStore.getState().user;
        if (JSON.stringify(initialUser) !== JSON.stringify(currentStoreUserForInit)) {
          console.log('[AuthProvider] initializeAuth: Updating user in store.');
          setUser(initialUser);
        }

        if (initialUser) {
          console.log(`[AuthProvider] initializeAuth: Initial user (ID: ${initialUser.id}). Attempting to fetch profile.`);
          try {
            const profileData = await getProfile(initialUser.id);
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
            setLoading(false); // Set loading false after profile attempt
          }
        } else {
          useAuthStore.getState().clearAuth(); // Use clearAuth
          const currentStoreProfileForInit = useAuthStore.getState().profile;
          if (currentStoreProfileForInit !== null) {
            console.log('[AuthProvider] initializeAuth: No initial user. Clearing profile in store.');
            setProfile(null); // Clear profile if no user
          }
          setLoading(false); // Set loading false if no user
        }
      } catch (e) {
        console.error('[AuthProvider] initializeAuth: Critical error during initial auth setup:', e);
        useAuthStore.getState().clearAuth(); // Use clearAuth
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
      // setLoading(true) was called at the start, now handled within branches
    };

    // setLoading(true); // Moved to be set once at the start, or managed within initializeAuth
    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true); // Set loading true at the start of listener
        console.log('[AuthProvider] onAuthStateChange FIRED.');
        console.log(`[AuthProvider] Event: ${event}, Session available: ${!!session}`);
        
        const listenerUser = session?.user ?? null;
        const currentStoreUser = useAuthStore.getState().user;

        console.log('[AuthProvider] Listener session user (listenerUser):', listenerUser ? { id: listenerUser.id, email: listenerUser.email } : null);
        console.log('[AuthProvider] Zustand store user BEFORE listener update (currentStoreUser):', currentStoreUser ? { id: currentStoreUser.id, email: currentStoreUser.email } : null);

        // Update user in store if it has actually changed
        if (JSON.stringify(listenerUser) !== JSON.stringify(currentStoreUser)) {
          console.log('[AuthProvider] Listener: Detected change in user object. Updating Zustand store user.');
          setUser(listenerUser);
        } else {
          console.log('[AuthProvider] Listener: No change detected in user object. Zustand store user not updated.');
        }

        if (listenerUser) {
          console.log(`[AuthProvider] Listener: User detected (ID: ${listenerUser.id}). Attempting to fetch profile.`);
          try {
            const profileData = await getProfile(listenerUser.id);
            const currentStoreProfile = useAuthStore.getState().profile;
            // Update profile in store if it has actually changed
            if (JSON.stringify(profileData) !== JSON.stringify(currentStoreProfile)) {
              console.log('[AuthProvider] Listener: Detected change in profile object or user changed. Updating Zustand store profile.');
              setProfile(profileData);
            }
            console.log('[AuthProvider] Listener: Profile fetched/verified successfully:', profileData ? { id: profileData.id } : null);
          } catch (error) {
            console.error('[AuthProvider] Listener: Error fetching profile:', error);
            setProfile(null); 
          } finally {
            setLoading(false); // Set loading false after profile attempt
          }
        } else {
          useAuthStore.getState().clearAuth(); // Use clearAuth
          console.log('[AuthProvider] Listener: No user session or SIGNED_OUT. Cleared auth. Setting loading to false.');
          setLoading(false); // Set loading false if no user or signed out
        }
        // setLoading(false); // Moved into branches
      }
    );
    
    return () => {
      console.log('[AuthProvider] Effect CLEANUP. Unsubscribing from onAuthStateChange.');
      authListener.subscription?.unsubscribe();
    };
  }, [supabase, setUser, setProfile, setLoading]);

  return <>{children}</>;
} 