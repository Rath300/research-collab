'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { FiGithub, FiUser, FiAlertCircle, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { getBrowserClient } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Spinner';

// Helper function to determine if a URL is from a trusted host
function isTrustedHost(url: string): boolean {
  const trustedHosts = [
    'research-collab-nine.vercel.app',
    'research-collab-standalone.vercel.app',
    'research-collab-3mdbxh5t2-shreyanshrath4-gmailcoms-projects.vercel.app',
    'research-collab-psbz8sdxg-shreyanshrath4-gmailcoms-projects.vercel.app',
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

function SignupContent() {
  const router = useRouter();
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state for email signup
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const handleOAuthSignup = async (provider: 'google' | 'github') => {
    try {
      setOauthLoading(provider);
      setError('');
      
      const supabase = getBrowserClient();
      
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
      console.error('OAuth signup error:', err);
      setError(err.message || 'Failed to sign up with ' + provider);
      setOauthLoading(null);
    }
  };
  
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    // Validate form
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (!agreeToTerms) {
      setError('You must agree to the Terms and Conditions');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const supabase = getBrowserClient();
      
      // Sign up with email and password
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: typeof window !== 'undefined'
            ? getSafeRedirectUrl('/auth/callback')
            : '/auth/callback',
        }
      });
      
      if (signupError) {
        throw signupError;
      }
      
      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        setSuccess('This email is already registered. Please check your email for confirmation instructions or try signing in.');
        return;
      }
      
      if (data?.user?.confirmed_at) {
        // User is already confirmed, redirect to the callback
        window.location.href = getSafeRedirectUrl('/auth/callback');
      } else {
        // Email confirmation required
        setSuccess('Please check your email for confirmation instructions.');
      }
    } catch (err: any) {
      console.error('Email signup error:', err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Join Research Collab</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create an account to connect with researchers</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create an account using your preferred method</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-red-900/20 dark:text-red-400">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-green-900/20 dark:text-green-400">
                <FiCheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}
            
            {showEmailForm ? (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<FiMail />}
                  required
                />
                
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<FiLock />}
                  required
                />
                
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<FiLock />}
                  required
                />
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    I agree to the <a href="#" className="text-primary-600 hover:text-primary-500">Terms and Conditions</a>
                  </label>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
                
                <div className="text-center">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="text-sm"
                  >
                    Back to other signup options
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <Button 
                  onClick={() => handleOAuthSignup('google')}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  isLoading={oauthLoading === 'google'}
                >
                  {oauthLoading !== 'google' && (
                    <FcGoogle className="mr-2 h-5 w-5" />
                  )}
                  Continue with Google
                </Button>
                
                <Button 
                  onClick={() => handleOAuthSignup('github')}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  isLoading={oauthLoading === 'github'}
                >
                  {oauthLoading !== 'github' && (
                    <FiGithub className="mr-2 h-5 w-5" />
                  )}
                  Continue with GitHub
                </Button>
                
                <Button
                  onClick={() => setShowEmailForm(true)}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <FiMail className="mr-2 h-5 w-5" />
                  Sign up with Email
                </Button>
                
                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">or</span>
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => {
                    const loginUrl = getSafeRedirectUrl('/login');
                    window.location.href = loginUrl;
                  }}
                >
                  Already have an account? Sign in
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Spinner size="large" />
        <h2 className="mt-4 text-xl font-medium">Loading...</h2>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
} 
          emailRedirectTo: typeof window !== 'undefined'
            ? getSafeRedirectUrl('/auth/callback')
            : '/auth/callback',
        }
      });
      
      if (signupError) {
        throw signupError;
      }
      
      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        setSuccess('This email is already registered. Please check your email for confirmation instructions or try signing in.');
        return;
      }
      
      if (data?.user?.confirmed_at) {
        // User is already confirmed, redirect to the callback
        window.location.href = getSafeRedirectUrl('/auth/callback');
      } else {
        // Email confirmation required
        setSuccess('Please check your email for confirmation instructions.');
      }
    } catch (err: any) {
      console.error('Email signup error:', err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Join Research Collab</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create an account to connect with researchers</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create an account using your preferred method</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-red-900/20 dark:text-red-400">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-green-900/20 dark:text-green-400">
                <FiCheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}
            
            {showEmailForm ? (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<FiMail />}
                  required
                />
                
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<FiLock />}
                  required
                />
                
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<FiLock />}
                  required
                />
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    I agree to the <a href="#" className="text-primary-600 hover:text-primary-500">Terms and Conditions</a>
                  </label>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
                
                <div className="text-center">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="text-sm"
                  >
                    Back to other signup options
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <Button 
                  onClick={() => handleOAuthSignup('google')}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  isLoading={oauthLoading === 'google'}
                >
                  {oauthLoading !== 'google' && (
                    <FcGoogle className="mr-2 h-5 w-5" />
                  )}
                  Continue with Google
                </Button>
                
                <Button 
                  onClick={() => handleOAuthSignup('github')}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  isLoading={oauthLoading === 'github'}
                >
                  {oauthLoading !== 'github' && (
                    <FiGithub className="mr-2 h-5 w-5" />
                  )}
                  Continue with GitHub
                </Button>
                
                <Button
                  onClick={() => setShowEmailForm(true)}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <FiMail className="mr-2 h-5 w-5" />
                  Sign up with Email
                </Button>
                
                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">or</span>
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => {
                    const loginUrl = getSafeRedirectUrl('/login');
                    window.location.href = loginUrl;
                  }}
                >
                  Already have an account? Sign in
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Spinner size="large" />
        <h2 className="mt-4 text-xl font-medium">Loading...</h2>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
} 