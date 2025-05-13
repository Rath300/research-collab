'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { getBrowserClient } from '@/lib/supabaseClient';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const supabase = getBrowserClient();
  
  // Check if user is authenticated via reset token or already has a session
  useEffect(() => {
    const checkSession = async () => {
      // Supabase client automatically handles the session from URL hash if present
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        setError("Could not verify your session. Please try resetting your password again.");
        // Potentially redirect to login if session check fails badly
        // router.push('/login'); 
        return;
      }
      
      // If no session (even after client processed URL hash) and no token in URL (already processed or never there)
      // This check might be redundant if onAuthStateChange is also redirecting, but good for explicit control.
      if (!data.session && !window.location.hash.includes('access_token')) {
        // Check if there was a recovery token error in the hash instead
        if (window.location.hash.includes('error_code=401')) {
            setError("Password reset link has expired or is invalid. Please request a new one.");
        } else if (window.location.hash.includes('error')) {
            setError("An error occurred with the password reset link. Please try again.");
        }
        // Delay redirect to allow user to see error message
        setTimeout(() => router.push('/login'), 3000);
      }
    };
    
    checkSession();
  }, [router, supabase]); // Added supabase to dependency array
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
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
    
    try {
      setIsLoading(true);
      setError('');
      
      // Update password using the new client
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Update password error:', err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">#</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">ResearchCollab</span>
            </div>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Update your password</CardTitle>
            <CardDescription>
              Create a new password for your account
            </CardDescription>
          </CardHeader>
          
          {isSuccess ? (
            <CardContent className="pt-4 pb-6">
              <div className="bg-green-50 text-green-600 p-4 rounded-md flex items-center space-x-3 text-sm dark:bg-green-900/20 dark:text-green-400">
                <FiCheckCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Password updated successfully!</p>
                  <p className="mt-1">You&apos;ll be redirected to the login page shortly.</p>
                </div>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-red-900/20 dark:text-red-400">
                    <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<FiLock />}
                  required
                />
                
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<FiLock />}
                  required
                />
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  isFullWidth
                >
                  Update Password
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
} 