'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { getBrowserClient } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link href="/" className="font-heading text-2xl font-bold text-neutral-200 hover:text-neutral-100 transition-colors">
          RESEARCH-BEE
        </Link>
      </div>
        
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Card className="w-full bg-neutral-950 border-none shadow-none p-6 sm:p-8">
          <CardHeader className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CardTitle className="font-heading text-3xl sm:text-4xl font-semibold text-neutral-100">
                Update your password
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-neutral-400 font-sans">
                Create a new, strong password for your account.
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          {isSuccess ? (
            <CardContent className="pt-4 pb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 mb-4 bg-green-900/30 border border-green-700/50 rounded-md text-green-300 text-sm flex items-center space-x-3"
              >
                <FiCheckCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Password updated successfully!</p>
                  <p className="mt-1 text-xs">You&apos;ll be redirected to login shortly.</p>
                </div>
              </motion.div>
            </CardContent>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardContent className="space-y-5">
                {error && (
                  <div className="p-3 mb-4 bg-red-900/30 border border-red-700/50 rounded-md text-red-300 text-sm flex items-center space-x-2">
                    <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div>
                  <label htmlFor="password" className="sr-only">New Password</label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="New password (min. 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-[#1C1C1C] border border-transparent text-neutral-200 placeholder:text-neutral-500 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 transition-colors"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">Confirm New Password</label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-[#1C1C1C] border border-transparent text-neutral-200 placeholder:text-neutral-500 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 transition-colors"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  isFullWidth
                  className="w-full px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-sans font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-950 transition-colors"
                  size="lg"
                >
                  Update Password
                </Button>
              </CardFooter>
            </motion.form>
          )}
           <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link 
                href="/login"
                className="inline-flex items-center text-sm font-sans text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Return to Login
              </Link>
            </motion.div>
        </Card>
      </motion.div>
      <motion.footer
        className="absolute bottom-6 text-center w-full text-xs text-neutral-500 font-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        &copy; {new Date().getFullYear()} Research-Bee. All rights reserved.
      </motion.footer>
    </div>
  );
} 