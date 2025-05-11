'use client';

import { useEffect } from 'react';
import { getBrowserClient } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import { getProfile } from '@/lib/api'; // Assuming getProfile is here
import type { User } from '@supabase/supabase-js';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const supabase = getBrowserClient();

  useEffect(() => {
    setLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          try {
            const profileData = await getProfile(currentUser.id);
            setProfile(profileData);
          } catch (error) {
            console.error('Error fetching profile in AuthProvider:', error);
            setProfile(null); // Clear profile on error
          }
        } else {
          setProfile(null); // Clear profile if no user
        }
        setLoading(false);
      }
    );

    // Initial check for user session on mount,
    // in case onAuthStateChange doesn't fire immediately for an existing session.
    // This part is tricky because onAuthStateChange should typically handle it.
    // We might rely on an initial fetch or let the middleware handle redirects first.
    // For now, let's ensure setLoading(false) is called after initial check or first event.
    // The `onAuthStateChange` typically fires with the current session immediately if one exists.

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        try {
          const profileData = await getProfile(currentUser.id);
          setProfile(profileData);
        } catch (error) {
          console.error('Error fetching profile on initial check:', error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false); // Ensure loading is set to false after initial check
    };

    checkInitialSession();


    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [supabase, setUser, setProfile, setLoading]);

  return <>{children}</>;
} 