'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { signUp } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Prepare metadata for profile creation
      const metadata = {
        first_name: formData.firstName,
        last_name: formData.lastName,
      };
      
      const data = await signUp(formData.email, formData.password, metadata);
      
      if (data.user) {
        setUser(data.user);
        
        // Show email confirmation message or redirect to complete profile
        router.push('/onboarding');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-8">
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
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Join ResearchCollab to connect with fellow researchers and collaborate on projects
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
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  placeholder="Jane"
                  value={formData.firstName}
                  onChange={handleChange}
                  leftIcon={<FiUser />}
                  required
                  autoComplete="given-name"
                />
                
                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  leftIcon={<FiUser />}
                  required
                  autoComplete="family-name"
                />
              </div>
              
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<FiMail />}
                required
                autoComplete="email"
              />
              
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<FiLock />}
                required
                autoComplete="new-password"
                helperText="Must be at least 6 characters long"
              />
              
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                leftIcon={<FiLock />}
                required
                autoComplete="new-password"
              />
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                isLoading={isLoading}
                isFullWidth
              >
                Sign up
              </Button>
              
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Log in
                </Link>
              </p>
              
              <p className="text-center text-xs text-gray-500 dark:text-gray-500">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-primary-600 dark:hover:text-primary-400">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-primary-600 dark:hover:text-primary-400">
                  Privacy Policy
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 