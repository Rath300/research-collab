'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { getBrowserClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { profiles } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Spinner size="large" />
        <h2 className="mt-4 text-xl font-medium">Loading...</h2>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setProfile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processing authentication...');
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to force clear auth state
  const forceClearAuth = async () => {
    try {
      setIsLoading(true);
      const supabase = getBrowserClient();
      await supabase.auth.signOut();
      
      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies related to auth
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      console.log('Auth state cleared, redirecting to login');
      
      // Redirect to login with fresh state
      window.location.href = '/login?fresh=true';
    } catch (err) {
      console.error('Error clearing auth:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Skip server-side rendering for this component
    if (typeof window === 'undefined') return;

    console.log('Auth callback page mounted');
    
    // Clean up all redirection flags
    sessionStorage.removeItem('is_redirecting');
    sessionStorage.setItem('redirect_count', '0');
    localStorage.setItem('last_page', '/auth/callback');
    
    let isMounted = true;
    
    const handleCallback = async () => {
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setError('Authentication is taking longer than expected. Please refresh the page or try again.');
        }
      }, 10000);

      try {
        // Get auth code from URL
        if (!searchParams) {
          throw new Error('No search params available');
        }

        const code = searchParams.get('code');
        if (!code) {
          throw new Error('No code found in URL');
        }

        console.log('Processing auth code from URL');
        setStatus('Processing your authentication...');

        // Exchange the code for a session
        const supabase = getBrowserClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          throw error;
        }

        if (!data.session || !data.user) {
          throw new Error('No session or user returned from authentication');
        }

        console.log('Authentication successful, session obtained');
        setStatus('Authentication successful! Retrieving your profile...');

        // Set the user in global state
        setUser(data.user);

        // Check if we're in a redirect loop and break it
        const redirectCount = parseInt(sessionStorage.getItem('redirect_count') || '0');
        if (redirectCount > 5) {
          console.error('Detected potential redirect loop, resetting flags');
          sessionStorage.removeItem('is_redirecting');
          sessionStorage.setItem('redirect_count', '0');
          localStorage.removeItem('onboarding_completed');
        }

        // Increment the redirect counter
        sessionStorage.setItem('redirect_count', (redirectCount + 1).toString());

        try {
          const userProfile = await profiles.getCurrentUserProfile();
          
          if (!isMounted) return;
          
          console.log('Profile retrieved successfully:', userProfile ? 'Yes' : 'No');
          
          // Store a flag in localStorage to indicate if onboarding was already completed
          const hasCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';
          
          if (userProfile) {
            setProfile(userProfile);
            
            // Clear final redirection flags
            sessionStorage.removeItem('is_redirecting');
            sessionStorage.setItem('redirect_count', '0');
            
            // Determine where to redirect based on profile completeness and onboarding history
            if (!userProfile.first_name || !userProfile.last_name) {
              // Profile is incomplete, redirect to onboarding
              console.log('Profile incomplete, redirecting to onboarding');
              setStatus('Authentication successful! Redirecting to complete your profile...');
              
              // Use window location for direct navigation
              window.location.href = '/onboarding';
            } else {
              // Profile is complete
              console.log('Profile complete, redirecting to dashboard');
              setStatus('Authentication successful! Redirecting to dashboard...');
              
              // Mark onboarding as completed
              localStorage.setItem('onboarding_completed', 'true');
              
              // Use window location for direct navigation
              const dashboardUrl = new URL('/dashboard', window.location.origin);
              dashboardUrl.searchParams.set('_t', Date.now().toString());
              window.location.href = dashboardUrl.toString();
            }
          } else {
            // No profile found, redirect to onboarding
            console.log('No profile found, redirecting to onboarding');
            setStatus('Authentication successful! Redirecting to set up your profile...');
            
            // Clear the onboarding completed flag
            localStorage.removeItem('onboarding_completed');
            
            // Use window location for direct navigation
            window.location.href = '/onboarding';
          }
        } catch (profileErr) {
          if (!isMounted) return;
          
          console.error('Error retrieving profile:', profileErr);
          setStatus('Authentication successful, but could not retrieve your profile. Redirecting to set up your profile...');
          
          // Clear the onboarding completed flag
          localStorage.removeItem('onboarding_completed');
          
          // Still go to onboarding if profile fetch fails
          window.location.href = '/onboarding';
        }
      } catch (err: any) {
        if (!isMounted) return;
        
        console.error('Authentication failed:', err);
        setError(err.message || 'Authentication failed. Please try again.');
        setStatus('There was a problem with the authentication process.');
      } finally {
        clearTimeout(timeoutId);
      }
    };
    
    // Delay the callback handling slightly to ensure the browser has processed the callback
    setTimeout(() => {
      handleCallback();
    }, 500);
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [router, setUser, setProfile, searchParams]);
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 max-w-md mx-auto text-center">
          <FiAlertCircle className="h-8 w-8 mx-auto mb-2" />
          <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
          <p className="mb-4">{error}</p>
          <div className="flex justify-center space-x-3">
            <Button
              onClick={() => router.push('/login')}
              className="mr-2"
            >
              Return to Login
            </Button>
            <Button
              variant="outline" 
              onClick={forceClearAuth}
              isLoading={isLoading}
              className="flex items-center"
            >
              {!isLoading && <FiRefreshCw className="mr-2 h-4 w-4" />}
              Reset Auth
            </Button>
          </div>
        </div>
        <p className="text-gray-500 mt-4">{status}</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Spinner size="large" />
      <h2 className="mt-4 text-xl font-medium">Completing Authentication</h2>
      <p className="mt-2 text-gray-500">{status}</p>
    </div>
  );
} 