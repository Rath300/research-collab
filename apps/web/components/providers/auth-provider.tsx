'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; 
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
    authError: storeAuthError, 
    setUser, 
    setProfile, 
    setLoading, 
    setAuthError,
    clearAuth 
  } = useAuthStore();
  const supabase = getBrowserClient();
  const router = useRouter(); 

  const fetchAndSetProfile = useCallback(async (currentUser: User) => {
    console.log(`[AuthProvider] fetchAndSetProfile called for user (ID: ${currentUser.id}).`);
    if (!useAuthStore.getState().isLoading) {
        setLoading(true);
    }
    try {
      const profileData = await getProfile(currentUser.id);
      setProfile(profileData);
      // Only clear authError if it matches the specific error we are trying to recover from.
      // This prevents clearing other potential auth errors prematurely.
      if (useAuthStore.getState().authError === 'Failed to load your profile. Please try refreshing the page.') {
          setAuthError(null); 
      }
      console.log('[AuthProvider] Profile fetched successfully in fetchAndSetProfile:', profileData ? { id: profileData.id, first_name: profileData.first_name } : null);
    } catch (error) {
      console.error('[AuthProvider] Error fetching profile in fetchAndSetProfile:', error);
      setProfile(null);
      setAuthError('Failed to load your profile. Please try refreshing the page.');
      console.log('[AuthProvider] Profile set to null due to fetch error in fetchAndSetProfile.');
    } finally {
      setLoading(false); 
    }
  }, [setProfile, setLoading, setAuthError]); // setUser is not needed here as currentUser is passed in

  // Effect for onAuthStateChange
  useEffect(() => {
    console.log('[AuthProvider] Mount/Effect RUNNING for onAuthStateChange listener.');
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
          setProfile(null); // Clear profile
          setAuthError(null); // Clear any auth errors
          setLoading(false); 
          console.log('[AuthProvider] No user session. Cleared profile and authError. Loading set to false.');
        }
      }
    );
    
    // Initial check on mount
    supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
        console.log('[AuthProvider] Initial getSession() on mount completed.');
        if (sessionError) {
            console.error("[AuthProvider] Error during initial getSession() call:", sessionError);
            setAuthError("Could not verify session initially. Please refresh.");
            setLoading(false);
            return;
        }

        const currentStoreState = useAuthStore.getState();
        if (session?.user) {
            console.log('[AuthProvider] Initial getSession() found user:', session.user.id, 
                        '. Current store user:', currentStoreState.user?.id, 
                        ', Store profile:', currentStoreState.profile?.id);
            if (!currentStoreState.user || currentStoreState.user.id !== session.user.id || !currentStoreState.profile) {
                 console.log('[AuthProvider] Initial getSession() indicates potential stale state or missing profile. Setting user and fetching profile.');
                 setUser(session.user); 
                 await fetchAndSetProfile(session.user);
            } else {
                 console.log('[AuthProvider] Initial getSession() found user and profile seems consistent with store. Setting loading to false if not already handled.');
                 if (currentStoreState.isLoading) setLoading(false); 
            }
        } else {
             console.log('[AuthProvider] Initial getSession() found no active session. Ensuring store is clear and loading is false.');
             if (currentStoreState.user || currentStoreState.profile || currentStoreState.authError) {
                setUser(null); 
                setProfile(null); 
                setAuthError(null);
             }
             if (currentStoreState.isLoading) setLoading(false);
        }
    }).catch(error => {
        // This catch is for network errors or unexpected issues with getSession() promise itself.
        console.error("[AuthProvider] Network/Promise error during initial getSession() on mount:", error);
        setAuthError("Could not verify session due to a network issue. Please check connection and refresh.");
        setLoading(false);
    });

    return () => {
      console.log('[AuthProvider] Effect CLEANUP for onAuthStateChange.');
      authListener.subscription?.unsubscribe();
    };
  }, [supabase, setUser, setProfile, setLoading, setAuthError, fetchAndSetProfile]);

  // New Effect to handle critical authError by signing out
  useEffect(() => {
    console.log('[AuthProvider] AuthError check effect. Current error:', storeAuthError, '. Current user in store:', storeUser?.id);
    if (storeAuthError === 'Failed to load your profile. Please try refreshing the page.' && storeUser) {
      console.warn('[AuthProvider] Critical auth error detected (profile fetch failed for existing session). Forcing logout.');
      
      supabase.auth.signOut().then(() => {
        console.log('[AuthProvider] Supabase signOut completed due to critical auth error.');
        // onAuthStateChange will handle clearing user/profile via setUser(null) and subsequent fetchAndSetProfile(null)
        // We ensure redirection happens after state is likely cleared.
        // Using a small timeout to allow state updates from onAuthStateChange to propagate before redirect
        setTimeout(() => {
            router.push('/login?error=session_issue');
        }, 50); 
      }).catch(err => {
        console.error('[AuthProvider] Error during forced signOut from authError effect:', err);
        clearAuth(); // Fallback: ensure client state is cleared
        setTimeout(() => {
             router.push('/login?error=session_issue_signout_failed');
        }, 50);
      });
    }
  }, [storeAuthError, storeUser, supabase, router, clearAuth]); // Added clearAuth

  return <>{children}</>;
} 