'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { FiUser, FiSave, FiAlertCircle, FiClock, FiMapPin, FiGlobe, FiRefreshCw } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { profiles, profilesApi } from '@/lib/api';
import { getBrowserClient } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Spinner';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, setProfile, setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    bio: profile?.bio || '',
    institution: profile?.institution || '',
    location: profile?.location || '',
    field_of_study: profile?.field_of_study || '',
    availability: profile?.availability || 'full-time'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Clean up any redirects or loops
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('is_redirecting');
          sessionStorage.setItem('redirect_count', '0');
          localStorage.setItem('last_page', '/onboarding');
        }
        
        const supabase = getBrowserClient();
        console.log('Checking auth status on onboarding page mount');
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        
        if (!sessionData?.session?.user) {
          console.log('No authenticated user found in session');
          throw new Error('No authenticated user');
        }
        
        // Got a valid session, now refresh user in store if needed
        if (!user) {
          console.log('Setting user in store from session');
          setUser(sessionData.session.user);
        }
        
        // Check if we have a profile
        try {
          console.log('Retrieving user profile');
          if (!profile) {
            const userProfile = await profiles.getCurrentUserProfile();
            if (userProfile) {
              console.log('Setting profile in store');
              setProfile(userProfile);
              
              // Update form data with profile info
              setFormData({
                first_name: userProfile.first_name || '',
                last_name: userProfile.last_name || '',
                bio: userProfile.bio || '',
                institution: userProfile.institution || '',
                location: userProfile.location || '',
                field_of_study: userProfile.field_of_study || '',
                availability: userProfile.availability || 'full-time'
              });
            }
          }
        } catch (profileError) {
          console.error('Error retrieving profile:', profileError);
          // Continue with onboarding even if we couldn't get the profile
        }
        
        setIsCheckingAuth(false);
      } catch (err) {
        console.error('Auth check error:', err);
        console.log('Redirecting to login from onboarding');
        
        // Clean up before redirecting
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('is_redirecting');
          sessionStorage.setItem('redirect_count', '0');
          
          // Use a timeout to avoid immediate redirection loops
          setTimeout(() => {
            router.push('/login');
          }, 100);
        }
      }
    };
    
    checkAuth();
  }, [user, profile, setUser, setProfile, router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name) {
      setError('First name and last name are required');
      return;
    }
    
    if (!user) {
      setError('No authenticated user found');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Use direct database access with more robust error handling
      const supabase = getBrowserClient();
      
      // Verify the session is still active before proceeding
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session) {
        console.error('Session error or missing before profile update:', sessionError);
        throw new Error('Your session has expired. Please sign in again.');
      }

      // Check if we're in a redirect loop
      const redirectCount = parseInt(sessionStorage.getItem('redirect_count') || '0');
      if (redirectCount > 5) {
        console.error('Detected potential redirect loop, clearing flags');
        sessionStorage.removeItem('is_redirecting');
        sessionStorage.setItem('redirect_count', '0');
      }

      // Ensure the profile ID is explicitly set to the user ID
      const profileData = {
        id: user.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        bio: formData.bio || null,
        institution: formData.institution || null,
        location: formData.location || null,
        field_of_study: formData.field_of_study || null,
        availability: formData.availability || 'full-time',
        updated_at: new Date().toISOString()
      };
      
      console.log('Attempting upsert operation with profile data:', profileData);
      
      // Always use upsert for reliability
      const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        })
        .select();
        
      if (upsertError) {
        console.error('Profile upsert error:', upsertError);
        // Try an alternative approach - direct insert
        try {
          console.log('Attempting direct insert as fallback');
          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select();
            
          if (insertError) {
            throw insertError;
          }
          
          if (insertData && insertData.length > 0) {
            console.log('Direct insert successful:', insertData);
            setProfile(insertData[0]);
          } else {
            throw new Error('Failed to save profile: No data returned');
          }
        } catch (insertErr) {
          console.error('Direct insert failed:', insertErr);
          throw new Error(`Failed to save profile: ${upsertError.message}`);
        }
      } else {
        console.log('Profile upsert successful:', upsertData);
        
        // If no data was returned but no error either, try a direct select to confirm
        let result = Array.isArray(upsertData) && upsertData.length > 0 ? upsertData[0] : null;
        
        if (!result) {
          console.log('No result from upsert, checking if profile exists...');
          const { data: profileCheck, error: profileCheckError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileCheckError) {
            console.error('Profile check error:', profileCheckError);
          } else if (profileCheck) {
            console.log('Found existing profile:', profileCheck);
            result = profileCheck;
          }
        }
        
        // Update global state with the profile
        if (result) {
          setProfile(result);
        } else {
          // Use the form data as a fallback
          const fallbackProfile = {
            id: user.id,
            ...profileData
          };
          console.log('Using fallback profile:', fallbackProfile);
          setProfile(fallbackProfile);
        }
      }
      
      console.log('Profile saved successfully, preparing to redirect to dashboard');
      
      // Ensure clean redirect
      sessionStorage.removeItem('is_redirecting');
      sessionStorage.setItem('redirect_count', '0');
      
      // Mark onboarding as completed
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('profile_saved', 'true');
      
      // Verify the session is still active after our updates
      const { data: finalSession, error: finalSessionError } = await supabase.auth.getSession();
      
      if (finalSessionError) {
        console.error('Error verifying final session:', finalSessionError);
        throw new Error('Session verification failed after profile update');
      }
      
      console.log('Final session check:', finalSession?.session ? 'Valid' : 'Invalid');
      
      // If no valid session, refresh it
      if (!finalSession?.session) {
        console.warn('No session found after profile update, attempting to refresh');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('Session refresh failed:', refreshError);
          throw new Error('Could not refresh your session. Please sign in again.');
        }
        
        console.log('Session refreshed successfully');
      }

      // Special handling for Supabase session
      try {
        // Make an explicit auth request to ensure cookies are set properly
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error('Final auth verification error:', authError);
        } else {
          console.log('Auth verification successful, user ID:', authData.user?.id);
        }

        // Set an auth transition flag to help middleware know we're in transition
        localStorage.setItem('auth_dashboard_transition', 'true');
        localStorage.setItem('last_auth_check', new Date().toISOString());
        
        // Store the user data in a separate storage as backup
        try {
          localStorage.setItem('auth_user_backup', JSON.stringify(authData?.user || user));
        } catch (e) {
          console.error('Could not store user backup:', e);
        }
      } catch (sessionErr) {
        console.error('Session preparation error:', sessionErr);
        // Continue with redirect anyway
      }
      
      // Add a delay to ensure cookies are properly set
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Redirecting to dashboard...');
      
      // Manually construct dashboard URL with query param to avoid caching
      const dashboardUrl = new URL('/dashboard', window.location.origin);
      dashboardUrl.searchParams.set('_t', Date.now().toString());
      
      // Use direct window location navigation for best cookie preservation
      window.location.href = dashboardUrl.toString();
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset and redirect to login
  const handleReset = async () => {
    try {
      setIsLoading(true);
      
      const supabase = getBrowserClient();
      await supabase.auth.signOut();
      
      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      setUser(null);
      setProfile(null);
      setError('');
      
      // Redirect to login
      window.location.href = '/login?fresh=true';
    } catch (err) {
      console.error('Reset error:', err);
      setError('Failed to reset authentication state');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="large" />
        <h2 className="mt-4 text-xl font-medium">Verifying your account...</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we load your profile.</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 max-w-md text-center">
          <FiAlertCircle className="h-8 w-8 mx-auto mb-2" />
          <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
          <p className="mb-4">You need to be signed in to access this page.</p>
          <Button onClick={() => router.push('/login')} className="mr-2">
            Go to Login
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Reset Auth
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Tell us a bit about yourself to get started</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Help others find and connect with you</CardDescription>
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
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  leftIcon={<FiUser />}
                  required
                />
                
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  leftIcon={<FiUser />}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Tell others about your research interests and expertise..."
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
                />
              </div>
              
              <Input
                label="Institution"
                name="institution"
                value={formData.institution || ''}
                onChange={handleInputChange}
                leftIcon={<FiGlobe />}
                placeholder="e.g., Stanford University"
              />
              
              <Input
                label="Location"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                leftIcon={<FiMapPin />}
                placeholder="e.g., San Francisco, CA"
              />
              
              <Input
                label="Field of Study"
                name="field_of_study"
                value={formData.field_of_study || ''}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Availability
                </label>
                <div className="flex items-center">
                  <FiClock className="mr-2 text-gray-500" />
                  <select
                    name="availability"
                    value={formData.availability || 'full-time'}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="not-available">Not Available</option>
                  </select>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                <FiRefreshCw className="mr-2" size={16} />
                Reset Auth
              </Button>
              
              <Button
                type="submit"
                isLoading={isLoading}
              >
                <FiSave className="mr-2" size={16} />
                Save Profile
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 