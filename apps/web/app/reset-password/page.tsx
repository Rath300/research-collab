'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { getBrowserClient } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const supabase = getBrowserClient();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (resetError) {
        throw resetError;
      }
      
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
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
        
      <Card className="w-full max-w-sm bg-neutral-950 border-none shadow-none p-6 sm:p-8">
        <CardHeader className="text-center mb-6">
          <CardTitle className="font-heading text-3xl sm:text-4xl font-semibold text-neutral-100">
            Reset your password
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-neutral-400 font-sans">
            Enter your email and we&apos;ll send a reset link.
            </CardDescription>
          </CardHeader>
          
        <CardContent>
          {isSuccess ? (
            <div className="p-4 mb-4 bg-green-900/30 border border-green-700/50 rounded-md text-green-300 text-sm flex items-center space-x-3">
                <FiCheckCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Password reset link sent!</p>
                <p className="mt-1 text-xs">Check your email for instructions.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                <div className="p-3 mb-4 bg-red-900/30 border border-red-700/50 rounded-md text-red-300 text-sm flex items-center space-x-2">
                    <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-[#1C1C1C] border border-transparent text-neutral-200 placeholder:text-neutral-500 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 transition-colors"
                />
              </div>
              
              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  isFullWidth
                  className="w-full px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-sans font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-950 transition-colors"
                  size="lg"
                >
                  Send reset link
                </Button>
              </div>
            </form>
          )}
          
          <div className="text-center mt-6">
            <Link 
              href="/login"
              className="inline-flex items-center text-sm font-sans text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <FiArrowLeft className="mr-1.5 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
        </Card>

      <footer className="absolute bottom-6 text-center w-full text-xs text-neutral-500 font-sans">
        &copy; {new Date().getFullYear()} Research-Bee. All rights reserved.
      </footer>
    </div>
  );
} 