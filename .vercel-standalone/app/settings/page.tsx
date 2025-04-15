'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FiUser, FiSave, FiUpload, FiAlertCircle } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getProfile, updateProfile, uploadAvatar } from '@/lib/api';
import { ProfileUpdateData } from '@/lib/schema';

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, setProfile } = useAuthStore();
  
  const [formData, setFormData] = useState<Partial<ProfileUpdateData>>({
    first_name: '',
    last_name: '',
    bio: '',
    institution: '',
    location: '',
    field_of_study: '',
    website: '',
    availability: 'full-time'
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        router.push('/login');
        return;
      }
      
      try {
        setIsLoading(true);
        
        if (!profile) {
          const profileData = await getProfile(user.id);
          setProfile(profileData);
        }
        
        if (profile) {
          setFormData({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            bio: profile.bio || '',
            institution: profile.institution || '',
            location: profile.location || '',
            field_of_study: profile.field_of_study || '',
            website: profile.website || '',
            availability: profile.availability || 'full-time'
          });
          
          if (profile.avatar_url) {
            setAvatarPreview(profile.avatar_url);
          }
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [user, profile, setProfile, router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setAvatarFile(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');
      
      // Upload avatar if selected
      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        const { url } = await uploadAvatar(user.id, avatarFile);
        avatarUrl = url;
      }
      
      // Update profile
      const updatedProfile = await updateProfile({
        ...formData,
        avatar_url: avatarUrl
      });
      
      // Update global state
      setProfile(updatedProfile);
      
      // Show success message
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden mb-4 relative">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-primary-600" size={36} />
                  )}
                </div>
                
                <p className="font-medium text-lg">{profile?.first_name} {profile?.last_name}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
                
                <div className="mt-4 w-full">
                  <label className="block w-full">
                    <span className="sr-only">Choose profile photo</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.querySelector('input[type="file"]')?.click()}
                    >
                      <FiUpload className="mr-2" size={16} />
                      Change Photo
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and public profile
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-red-900/20 dark:text-red-400">
                    <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm dark:bg-green-900/20 dark:text-green-400">
                    {success}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <Input
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <Input
                  label="Bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  type="textarea"
                  rows={4}
                  placeholder="Write a short bio about yourself..."
                />
                
                <Input
                  label="Institution"
                  name="institution"
                  value={formData.institution || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Stanford University"
                />
                
                <Input
                  label="Location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., San Francisco, CA"
                />
                
                <Input
                  label="Field of Study"
                  name="field_of_study"
                  value={formData.field_of_study || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Science"
                />
                
                <Input
                  label="Website"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., https://yourwebsite.com"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={formData.availability || 'full-time'}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="not-available">Not Available</option>
                  </select>
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    isLoading={isSaving}
                  >
                    <FiSave className="mr-2" size={16} />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 