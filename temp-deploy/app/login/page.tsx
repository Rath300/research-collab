'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FiGithub, FiUser, FiAlertCircle, FiRefreshCw, FiCoffee, FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { getBrowserClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';
import { profiles } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

// Helper function to determine if a URL is from a trusted host
function isTrustedHost(url: string): boolean {
  const trustedHosts = [
    'research-collab-nine.vercel.app',
    'research-collab-standalone.vercel.app',
    'research-collab-3mdbxh5t2-shreyanshrath4-gmailcoms-projects.vercel.app',
    'research-collab-fgo5ecn3i-shreyanshrath4-gmailcoms-projects.vercel.app',
    'research-collab-lc8mswyy8-shreyanshrath4-gmailcoms-projects.vercel.app',
    'research-collab-nz4t0q7pu-shreyanshrath4-gmailcoms-projects.vercel.app',
    'research-collab-rmit9gk5s-shreyanshrath4-gmailcoms-projects.vercel.app',
    'research-collab-52jhs7qjs-shreyanshrath4-gmailcoms-projects.vercel.app',
    'shreyanshrath4-gmailcoms-projects.vercel.app',
    'localhost'
  ];
  
  return trustedHosts.some(host => url.includes(host));
}

// Helper to get a safe redirect URL
function getSafeRedirectUrl(path: string): string {
  try {
    const url = new URL(path, window.location.origin);
    if (isTrustedHost(url.toString())) {
      return url.toString();
    }
    return new URL(path, 'https://research-collab-nine.vercel.app').toString();
  } catch (e) {
    // If the URL construction fails, return a default URL
    return 'https://research-collab-nine.vercel.app' + path;
  }
}

// Content component with useSearchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo');
  const loopDetected = searchParams?.get('loop') === 'true';
  
  const { setUser, setProfile, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  // Modify the useEffect in LoginContent component to limit auth checks
  useEffect(() => {
    let isChecking = true;
    let timeoutId: NodeJS.Timeout;
    
    // Check if we're already in a redirect loop
    const redirectCount = parseInt(sessionStorage.getItem('redirect_count') || '0');
    console.log('Login page - current redirect count:', redirectCount);
    
    // Don't check session if we're in a loop already
    if (loopDetected || redirectCount > 3) {
      console.log('Loop detected or too many redirects, clearing auth state');
      setUser(null);
      setProfile(null);
      setIsCheckingSession(false);
      sessionStorage.setItem('redirect_count', '0');
      sessionStorage.removeItem('is_redirecting');
      return;
    }
    
    // Store the auth check attempt in sessionStorage to prevent infinite loops
    const checkAttempt = typeof window !== 'undefined' ? 
      parseInt(sessionStorage.getItem('auth_check_attempt') || '0') : 0;
    
    // If we've tried too many times, stop checking
    if (checkAttempt > 3) {
      console.log('Too many auth check attempts, stopping');
      setIsCheckingSession(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_check_attempt', '0');
      }
      return;
    }
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_check_attempt', (checkAttempt + 1).toString());
      // Ensure we don't have a stale redirection flag
      sessionStorage.removeItem('is_redirecting');
      console.log('Auth check attempt:', checkAttempt + 1);
    }
    
    const checkSession = async () => {
      try {
        setIsCheckingSession(true);
        const supabase = getBrowserClient();
        
        // Set a timeout for session check
        timeoutId = setTimeout(() => {
          if (isChecking) {
            console.log('Session check timed out, continuing with login page');
            setIsCheckingSession(false);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('auth_check_attempt', '0');
            }
          }
        }, 3000); // Increased to 3 seconds
        
        console.log('Checking for existing Supabase session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (!isChecking) return;
        clearTimeout(timeoutId);
        
        if (sessionError) {
          console.error('Session check error:', sessionError);
          setIsCheckingSession(false);
          return;
        }
        
        console.log('Auth session result:', sessionData?.session ? 'Found session' : 'No session');
        
        if (sessionData?.session?.user) {
          console.log('User is logged in, user ID:', sessionData.session.user.id);
          
          // Set the user in global state
          setUser(sessionData.session.user);
          
          // Reset the attempt counter
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('auth_check_attempt', '0');
          }
          
          try {
            // Get user profile
            console.log('Retrieving user profile...');
            const userProfile = await profiles.getCurrentUserProfile();
            
            if (!isChecking) return;
            
            if (userProfile) {
              console.log('Profile found, ID:', userProfile.id);
              setProfile(userProfile);
              
              // Check if profile is incomplete and needs onboarding
              const needsOnboarding = !userProfile.first_name || !userProfile.last_name;
              
              // Simple redirect based on profile completeness
              sessionStorage.setItem('is_redirecting', 'true');
              
              if (needsOnboarding) {
                console.log('Profile incomplete, redirecting to onboarding');
                // Clear any onboarding completion flag
                localStorage.removeItem('onboarding_completed');
                window.location.href = '/onboarding';
              } else {
                console.log('Profile complete, redirecting to dashboard');
                // Mark onboarding as completed
                localStorage.setItem('onboarding_completed', 'true');
                window.location.href = redirectTo || '/dashboard';
              }
            } else {
              // No profile found
              console.log('No profile found, redirecting to onboarding');
              
              // Reset redirect count before redirect
              sessionStorage.setItem('redirect_count', '0');
              
              // Increment redirect count to track potential loops
              const newRedirectCount = parseInt(sessionStorage.getItem('redirect_count') || '0') + 1;
              sessionStorage.setItem('redirect_count', newRedirectCount.toString());
              
              // Add a small delay before redirecting
              setTimeout(() => {
                sessionStorage.setItem('is_redirecting', 'true');
                window.location.href = '/onboarding';
              }, 500);
            }
          } catch (profileErr) {
            console.error('Profile fetch error:', profileErr);
            
            // Reset redirect count before redirect
            sessionStorage.setItem('redirect_count', '0');
            
            // Add a small delay before redirecting
            setTimeout(() => {
              // Still redirect to onboarding if profile fetch fails
              sessionStorage.setItem('is_redirecting', 'true');
              window.location.href = '/onboarding';
            }, 500);
          }
        } else {
          console.log('No active session found, showing login options');
          setIsCheckingSession(false);
          // Reset the attempt counter
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('auth_check_attempt', '0');
            // Reset redirect count when showing login options
            sessionStorage.setItem('redirect_count', '0');
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        setIsCheckingSession(false);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_check_attempt', '0');
          // Reset redirect count on error
          sessionStorage.setItem('redirect_count', '0');
        }
      } finally {
        isChecking = false;
        clearTimeout(timeoutId);
      }
    };
    
    checkSession();
    
    return () => {
      isChecking = false;
      clearTimeout(timeoutId);
    };
  }, [router, setUser, setProfile, loopDetected, redirectTo]);
  
  // Display a special message for redirect loop
  useEffect(() => {
    if (loopDetected) {
      setError('We detected a potential login loop. Please try signing in again or clear your cookies and refresh the page.');
    }
  }, [loopDetected]);
  
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      // Clear any existing auth data first
      const supabase = getBrowserClient();
      await supabase.auth.signOut();
      
      // Reset the auth check and redirection flags
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_check_attempt', '0');
        sessionStorage.removeItem('is_redirecting');
      }
      
      setOauthLoading(provider);
      setError('');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' 
            ? getSafeRedirectUrl('/auth/callback')
            : '/auth/callback',
        },
      });
      
      if (error) {
        throw error;
      }
      
      // The user will be redirected to the OAuth provider
    } catch (err: any) {
      console.error('OAuth login error:', err);
      setError(err.message || 'Failed to sign in with ' + provider);
      setOauthLoading(null);
    }
  };
  
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      
      if (!email || !password) {
        setError('Please enter both email and password');
        setIsLoading(false);
        return;
      }
      
      // Clear any existing auth data first
      const supabase = getBrowserClient();
      await supabase.auth.signOut();
      
      // Reset the auth check and redirection flags
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_check_attempt', '0');
        sessionStorage.removeItem('is_redirecting');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Set the authenticated user in global state
        setUser(data.user);
        
        try {
          // Get user profile
          const userProfile = await profiles.getCurrentUserProfile();
          
          // Set profile in global state
          setProfile(userProfile);
          
          // Reset redirection flags
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('auth_check_attempt', '0');
            
            // Set redirection flag to prevent multiple redirects
            sessionStorage.setItem('is_redirecting', 'true');
            
            // Add a small delay to ensure state is updated
            setTimeout(() => {
              if (redirectTo) {
                // If there's a redirectTo parameter, use it (but make sure it's relative)
                const safePath = redirectTo.startsWith('/') ? redirectTo : '/dashboard';
                window.location.href = getSafeRedirectUrl(safePath);
              } else {
                // Otherwise redirect to dashboard
                window.location.href = getSafeRedirectUrl('/dashboard');
              }
            }, 300);
          }
        } catch (profileErr: any) {
          console.error('Profile error:', profileErr);
          
          // Reset redirection flags
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('auth_check_attempt', '0');
            sessionStorage.setItem('is_redirecting', 'true');
            
            // If profile fetch fails, redirect to onboarding
            window.location.href = getSafeRedirectUrl('/onboarding');
          }
        }
      }
    } catch (err: any) {
      console.error('Email login error:', err);
      setError(err.message || 'Failed to sign in with email and password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGuestLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Reset the auth check and redirection flags
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_check_attempt', '0');
        sessionStorage.removeItem('is_redirecting');
      }
      
      // Create a temporary guest user
      const guestId = uuidv4();
      const guestUser = {
        id: guestId,
        email: `guest-${guestId.slice(0, 8)}@example.com`,
        role: 'guest',
        aud: 'authenticated',
        user_metadata: {
          is_guest: true
        }
      };
      
      // Create a guest profile
      const guestProfile = {
        id: guestId,
        user_id: guestId,
        first_name: 'Guest',
        last_name: 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar_url: null,
        institution: 'Guest Account',
      };
      
      // Set the user and profile in the auth store
      setUser(guestUser);
      setProfile(guestProfile);
      
      // Use direct window location redirect instead of router for more reliable navigation
      console.log('Redirecting guest to dashboard...');
      
      // Set redirection flag to prevent multiple redirects
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('is_redirecting', 'true');
        
        // Add a small delay to ensure state is updated before redirect
        setTimeout(() => {
          if (redirectTo) {
            // If there's a redirectTo parameter, use it (but make sure it's relative)
            const safePath = redirectTo.startsWith('/') ? redirectTo : '/dashboard';
            window.location.href = getSafeRedirectUrl(safePath);
          } else {
            // Otherwise go to dashboard
            window.location.href = getSafeRedirectUrl('/dashboard');
          }
        }, 300);
      }
    } catch (err: any) {
      console.error('Guest login error:', err);
      setError(err.message || 'Failed to continue as guest');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a forceClearAuth function to handle loops
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
      
      setUser(null);
      setProfile(null);
      setError('');
      
      console.log('Auth state cleared, reloading page');
      
      // Reload the page without the loop parameter
      window.location.href = `${window.location.origin}/login?fresh=true`;
    } catch (err) {
      console.error('Error clearing auth:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isCheckingSession) {
    // Get checkAttempt value for display
    const checkAttemptValue = typeof window !== 'undefined' ? 
      parseInt(sessionStorage.getItem('auth_check_attempt') || '0') : 0;
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="large" />
        <h2 className="mt-4 text-xl font-medium">Checking authentication...</h2>
        <p className="mt-2 text-sm text-gray-500">
          {loopDetected ? 'Loop detected. Resetting auth state...' : 'Verifying your session...'}
        </p>
        <p className="mt-1 text-xs text-gray-400">Attempt: {checkAttemptValue}/3</p>
        <Button 
          variant="ghost" 
          className="mt-4"
          onClick={forceClearAuth}
        >
          <FiRefreshCw className="mr-1 h-4 w-4" />
          Reset Auth &amp; Reload
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Research Collab</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Connect and collaborate with researchers worldwide</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Continue with your preferred method</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-red-900/20 dark:text-red-400">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
                {loopDetected && (
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={forceClearAuth}
                    className="ml-2"
                    isLoading={isLoading}
                  >
                    {!isLoading && <FiRefreshCw className="mr-1 h-4 w-4" />}
                    Clear & Refresh
                  </Button>
                )}
              </div>
            )}
            
            {showEmailForm ? (
              <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<FiMail />}
                  required
                />
                
                <Input
                  label="Password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<FiLock />}
                  required
                />
                
                <Button 
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Sign in
                </Button>
                
                <p className="text-center text-sm">
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto text-sm"
                    onClick={() => setShowEmailForm(false)}
                    disabled={isLoading}
                  >
                    Back to other sign in options
                  </Button>
                </p>
              </form>
            ) : (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={() => handleOAuthLogin('google')}
                  isLoading={oauthLoading === 'google'}
                >
                  {oauthLoading !== 'google' && (
                    <FcGoogle className="mr-2 h-5 w-5" />
                  )}
                  Continue with Google
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center" 
                  onClick={() => handleOAuthLogin('github')}
                  isLoading={oauthLoading === 'github'}
                >
                  {oauthLoading !== 'github' && (
                    <FiGithub className="mr-2 h-5 w-5" />
                  )}
                  Continue with GitHub
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={() => setShowEmailForm(true)}
                >
                  <FiMail className="mr-2 h-5 w-5" />
                  Continue with Email
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      Or
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-center text-gray-600 dark:text-gray-400"
                  onClick={handleGuestLogin}
                  isLoading={isLoading}
                >
                  {!isLoading && (
                    <FiUser className="mr-2 h-5 w-5" />
                  )}
                  Continue as Guest
                </Button>
                
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                  Don&apos;t have an account?{" "}
                  <Button
                    variant="ghost"
                    className="p-0 h-auto text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    onClick={() => router.push('/signup')}
                  >
                    Sign up
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main component wrapped in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="large" />
        <h2 className="mt-4 text-xl font-medium">Loading...</h2>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
} 
                const safePath = redirectTo.startsWith('/') ? redirectTo : '/dashboard';
                window.location.href = getSafeRedirectUrl(safePath);
              } else {
                // Otherwise redirect to dashboard
                window.location.href = getSafeRedirectUrl('/dashboard');
              }
            }, 300);
          }
        } catch (profileErr: any) {
          console.error('Profile error:', profileErr);
          
          // Reset redirection flags
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('auth_check_attempt', '0');
            sessionStorage.setItem('is_redirecting', 'true');
            
            // If profile fetch fails, redirect to onboarding
            window.location.href = getSafeRedirectUrl('/onboarding');
          }
        }
      }
    } catch (err: any) {
      console.error('Email login error:', err);
      setError(err.message || 'Failed to sign in with email and password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGuestLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Reset the auth check and redirection flags
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_check_attempt', '0');
        sessionStorage.removeItem('is_redirecting');
      }
      
      // Create a temporary guest user
      const guestId = uuidv4();
      const guestUser = {
        id: guestId,
        email: `guest-${guestId.slice(0, 8)}@example.com`,
        role: 'guest',
        aud: 'authenticated',
        user_metadata: {
          is_guest: true
        }
      };
      
      // Create a guest profile
      const guestProfile = {
        id: guestId,
        user_id: guestId,
        first_name: 'Guest',
        last_name: 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar_url: null,
        institution: 'Guest Account',
      };
      
      // Set the user and profile in the auth store
      setUser(guestUser);
      setProfile(guestProfile);
      
      // Use direct window location redirect instead of router for more reliable navigation
      console.log('Redirecting guest to dashboard...');
      
      // Set redirection flag to prevent multiple redirects
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('is_redirecting', 'true');
        
        // Add a small delay to ensure state is updated before redirect
        setTimeout(() => {
          if (redirectTo) {
            // If there's a redirectTo parameter, use it (but make sure it's relative)
            const safePath = redirectTo.startsWith('/') ? redirectTo : '/dashboard';
            window.location.href = getSafeRedirectUrl(safePath);
          } else {
            // Otherwise go to dashboard
            window.location.href = getSafeRedirectUrl('/dashboard');
          }
        }, 300);
      }
    } catch (err: any) {
      console.error('Guest login error:', err);
      setError(err.message || 'Failed to continue as guest');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a forceClearAuth function to handle loops
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
      
      setUser(null);
      setProfile(null);
      setError('');
      
      console.log('Auth state cleared, reloading page');
      
      // Reload the page without the loop parameter
      window.location.href = `${window.location.origin}/login?fresh=true`;
    } catch (err) {
      console.error('Error clearing auth:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isCheckingSession) {
    // Get checkAttempt value for display
    const checkAttemptValue = typeof window !== 'undefined' ? 
      parseInt(sessionStorage.getItem('auth_check_attempt') || '0') : 0;
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="large" />
        <h2 className="mt-4 text-xl font-medium">Checking authentication...</h2>
        <p className="mt-2 text-sm text-gray-500">
          {loopDetected ? 'Loop detected. Resetting auth state...' : 'Verifying your session...'}
        </p>
        <p className="mt-1 text-xs text-gray-400">Attempt: {checkAttemptValue}/3</p>
        <Button 
          variant="ghost" 
          className="mt-4"
          onClick={forceClearAuth}
        >
          <FiRefreshCw className="mr-1 h-4 w-4" />
          Reset Auth &amp; Reload
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Research Collab</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Connect and collaborate with researchers worldwide</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Continue with your preferred method</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-red-900/20 dark:text-red-400">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
                {loopDetected && (
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={forceClearAuth}
                    className="ml-2"
                    isLoading={isLoading}
                  >
                    {!isLoading && <FiRefreshCw className="mr-1 h-4 w-4" />}
                    Clear & Refresh
                  </Button>
                )}
              </div>
            )}
            
            {showEmailForm ? (
              <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<FiMail />}
                  required
                />
                
                <Input
                  label="Password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<FiLock />}
                  required
                />
                
                <Button 
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Sign in
                </Button>
                
                <p className="text-center text-sm">
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto text-sm"
                    onClick={() => setShowEmailForm(false)}
                    disabled={isLoading}
                  >
                    Back to other sign in options
                  </Button>
                </p>
              </form>
            ) : (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={() => handleOAuthLogin('google')}
                  isLoading={oauthLoading === 'google'}
                >
                  {oauthLoading !== 'google' && (
                    <FcGoogle className="mr-2 h-5 w-5" />
                  )}
                  Continue with Google
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center" 
                  onClick={() => handleOAuthLogin('github')}
                  isLoading={oauthLoading === 'github'}
                >
                  {oauthLoading !== 'github' && (
                    <FiGithub className="mr-2 h-5 w-5" />
                  )}
                  Continue with GitHub
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={() => setShowEmailForm(true)}
                >
                  <FiMail className="mr-2 h-5 w-5" />
                  Continue with Email
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      Or
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-center text-gray-600 dark:text-gray-400"
                  onClick={handleGuestLogin}
                  isLoading={isLoading}
                >
                  {!isLoading && (
                    <FiUser className="mr-2 h-5 w-5" />
                  )}
                  Continue as Guest
                </Button>
                
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                  Don&apos;t have an account?{" "}
                  <Button
                    variant="ghost"
                    className="p-0 h-auto text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    onClick={() => router.push('/signup')}
                  >
                    Sign up
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main component wrapped in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="large" />
        <h2 className="mt-4 text-xl font-medium">Loading...</h2>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
} 