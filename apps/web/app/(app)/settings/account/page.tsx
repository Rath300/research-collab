'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { getBrowserClient } from '@/lib/supabaseClient';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input as CustomInput } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { FiUser, FiSave, FiLoader, FiAlertCircle, FiCamera } from 'react-icons/fi';
import { type Database } from '@/lib/database.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export default function AccountSettingsPage() {
  const supabase = getBrowserClient();
  const { user, profile, setProfile, setLoading: setAuthLoading } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [initialAvatarUrl, setInitialAvatarUrl] = useState<string | null>(null);

  const [formLoading, setFormLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProfileData = useCallback(async (userId: string) => {
    setFormLoading(true);
    try {
      const { data: profileDataFromDb, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single<ProfileRow>();

      if (profileError) throw profileError;

      if (profileDataFromDb) {
        const profileForStore = {
          ...profileDataFromDb,
          created_at: new Date(profileDataFromDb.created_at),
          updated_at: profileDataFromDb.updated_at ? new Date(profileDataFromDb.updated_at) : new Date(),
        };

        setProfile(profileForStore as any);
        
        setFirstName(profileDataFromDb.first_name || '');
        setLastName(profileDataFromDb.last_name || '');
        setBio(profileDataFromDb.bio || '');
        setAvatarUrl(profileDataFromDb.avatar_url || null);
        setInitialAvatarUrl(profileDataFromDb.avatar_url || null);
      }
    } catch (err) {
      console.error("Failed to load profile for settings page:", err);
      setError("Could not load your profile data.");
    } finally {
      setFormLoading(false);
    }
  }, [supabase, setProfile]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || null);
      setInitialAvatarUrl(profile.avatar_url || null);
      setFormLoading(false);
    } else if (user) {
      loadProfileData(user.id);
    }
  }, [user, profile, loadProfileData]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError('User not authenticated.');
      return;
    }

    // Debugging logs for RLS issue
    console.log('[ProfileUpdate] Attempting update. User object from auth store:', user);
    if (user) {
      console.log('[ProfileUpdate] User ID being used for update (user.id from store):', user.id);
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let newAvatarPath: string | undefined = initialAvatarUrl || undefined;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        newAvatarPath = urlData.publicUrl;
      }

      const updates: Partial<ProfileRow> = {
        id: user.id, 
        first_name: firstName,
        last_name: lastName,
        bio: bio,
        avatar_url: newAvatarPath,
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccessMessage('Profile updated successfully!');
      await loadProfileData(user.id);
      setAvatarFile(null); 
      if (newAvatarPath) setInitialAvatarUrl(newAvatarPath);

    } catch (err: any) {
      console.error('Error updating profile:', err);
      const defaultMessage = 'Failed to update profile.';
      setError(err.message || defaultMessage);
    } finally {
      setSaving(false);
    }
  };

  if (formLoading && !profile) {
    return (
      <PageContainer title="Account Settings" className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.20))]">
        <FiLoader className="animate-spin text-accent-purple text-4xl" />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Account Settings" className="py-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-neutral-900 border border-neutral-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-heading text-neutral-100 flex items-center">
              <FiUser className="mr-3 text-accent-purple" /> Your Profile
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Manage your personal information and account settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar 
                  src={avatarUrl}
                  fallback={`${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U'}
                  alt="User avatar"
                  className="w-32 h-32 text-4xl border-2 border-neutral-700"
                />
                <div className="relative">
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer sr-only"
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('avatar')?.click()}>
                    <FiCamera className="mr-2" /> Change Photo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-neutral-300 mb-1">First Name</label>
                  <CustomInput 
                    id="firstName" 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    placeholder="Your first name"
                    className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-neutral-300 mb-1">Last Name</label>
                  <CustomInput 
                    id="lastName" 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    placeholder="Your last name"
                    className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-neutral-300 mb-1">Bio</label>
                <Textarea 
                  id="bio" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Tell us a bit about yourself..."
                  rows={4}
                  className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
                />
              </div>

              {error && (
                <div className="flex items-center text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
                  <FiAlertCircle className="mr-2 flex-shrink-0" /> 
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="flex items-center text-sm text-green-500 bg-green-500/10 p-3 rounded-md">
                  <FiSave className="mr-2 flex-shrink-0" /> 
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving || formLoading} variant="primary">
                  {saving ? (
                    <><FiLoader className="animate-spin mr-2" /> Saving...</>
                  ) : (
                    <><FiSave className="mr-2" /> Save Changes</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
} 