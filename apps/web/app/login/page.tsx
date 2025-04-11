'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { signIn } from '@/lib/supabase';
import { getProfile } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setProfile } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const data = await signIn(email, password);
      
      if (data.user) {
        setUser(data.user);
        
        // Get user profile
        const userProfile = await getProfile(data.user.id);
        setProfile(userProfile);
        
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
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
            <CardTitle>Log in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-red-900/20 dark:text-red-400">
                  <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<FiMail />}
                required
                autoComplete="email"
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<FiLock />}
                required
                autoComplete="current-password"
              />
              
              <div className="text-right">
                <Link
                  href="/reset-password"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                isLoading={isLoading}
                isFullWidth
              >
                Log in
              </Button>
              
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 