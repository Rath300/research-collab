'use client'

import { useState, useEffect, useRef } from 'react'
import { getBrowserClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/select'
import { useAuthStore } from '@/lib/store'
import { uploadAvatar } from '@/lib/api'
import { type Profile, profileSchema } from '@research-collab/db'
import { FiUser, FiUpload, FiAlertCircle, FiCheckCircle, FiX, FiSave, FiPlusCircle, FiTrash2 } from 'react-icons/fi'
import { Avatar } from '@/components/ui/Avatar'

interface ProfileFormData {
  full_name: string;
  bio: string;
  institution: string;
  research_interests: string[];
  skills: string[];
  collaboration_pitch: string;
  location: string;
  field_of_study: string;
  availability: 'full-time' | 'part-time' | 'weekends' | 'not-available';
  visibility: 'public' | 'private' | 'connections';
  website: string;
  education_json: string;
}

interface ProfileFormProps {
  initialData?: Partial<Profile>;
  onProfileUpdate?: () => void;
}

const formatJsonString = (jsonString: string | null | undefined): string => {
  if (!jsonString) return '[]';
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return typeof jsonString === 'string' ? jsonString : '[]';
  }
};

export function ProfileForm({ initialData, onProfileUpdate }: ProfileFormProps) {
  const router = useRouter()
  const supabase = getBrowserClient()
  const { user, profile: authProfile, setProfile } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ProfileFormData>(() => {
    const source = initialData || authProfile;
    const constructedFullName = source ? `${source.first_name || ''} ${source.last_name || ''}`.trim() : '';
    
    return {
      full_name: constructedFullName,
      bio: source?.bio || '',
      institution: source?.institution || '',
      research_interests: source?.interests || [],
      skills: source?.skills || [],
      collaboration_pitch: source?.collaboration_pitch || '',
      location: source?.location || '',
      field_of_study: source?.field_of_study || '',
      availability: source?.availability || 'full-time',
      visibility: source?.visibility || 'public',
      website: source?.website || '',
      education_json: formatJsonString(source?.education as string | undefined),
    };
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar_url || authProfile?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentProfileSource = initialData || authProfile;
    if (currentProfileSource) {
        const constructedFullName = `${currentProfileSource.first_name || ''} ${currentProfileSource.last_name || ''}`.trim();
        setFormData({
            full_name: constructedFullName,
            bio: currentProfileSource.bio || '',
            institution: currentProfileSource.institution || '',
            research_interests: currentProfileSource.interests || [], 
            skills: currentProfileSource.skills || [],
            collaboration_pitch: currentProfileSource.collaboration_pitch || '',
            location: currentProfileSource.location || '',
            field_of_study: currentProfileSource.field_of_study || '',
            availability: currentProfileSource.availability || 'full-time',
            visibility: currentProfileSource.visibility || 'public',
            website: currentProfileSource.website || '',
            education_json: formatJsonString(currentProfileSource.education as string | undefined),
        });
        if (currentProfileSource.avatar_url) {
            setAvatarPreview(currentProfileSource.avatar_url);
        }
    }
  }, [initialData, authProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (!user) throw new Error('Not authenticated')

      const nameParts = formData.full_name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      let newAvatarUrl = avatarPreview;

      if (avatarFile) {
        const uploadResult = await uploadAvatar(user.id, avatarFile);
        if (uploadResult && typeof uploadResult.url === 'string') {
          newAvatarUrl = uploadResult.url;
        } else {
          console.warn('Avatar upload failed or did not return a URL. Using existing avatar_url or preview.');
        }
      }
      
      let educationDataToSave: any = null;
      try {
        educationDataToSave = formData.education_json ? JSON.parse(formData.education_json) : null;
      } catch (jsonError) {
        console.warn("Education data is not valid JSON, attempting to save as raw string if non-empty.");
        educationDataToSave = formData.education_json || null;
      }

      const profileDataToSave: Omit<Profile, 'id' | 'user_id' | 'updated_at' | 'email'> & { id: string; user_id: string; updated_at: string } = {
        id: user.id,
        user_id: user.id, 
        first_name: firstName,
        last_name: lastName,
        bio: formData.bio || null,
        institution: formData.institution || null,
        interests: formData.research_interests, 
        skills: formData.skills,
        collaboration_pitch: formData.collaboration_pitch || null,
        location: formData.location || null,
        field_of_study: formData.field_of_study || null,
        availability: formData.availability as Profile['availability'],
        visibility: formData.visibility as Profile['visibility'],
        website: formData.website || null,
        education: educationDataToSave,
        avatar_url: newAvatarUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedProfileData, error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileDataToSave as any)
        .select('*')
        .single();

      if (upsertError) throw upsertError

      setSuccess('Profile saved successfully!');
      if (updatedProfileData) {
        const profileForStore: Profile = {
          id: updatedProfileData.id,
          user_id: updatedProfileData.user_id || user.id,
          updated_at: updatedProfileData.updated_at ? new Date(updatedProfileData.updated_at) : new Date(),
          first_name: updatedProfileData.first_name || null,
          last_name: updatedProfileData.last_name || null,
          email: authProfile?.email || user.email || null,
          avatar_url: updatedProfileData.avatar_url || null,
          institution: updatedProfileData.institution || null,
          bio: updatedProfileData.bio || null,
          website: updatedProfileData.website || null,
          skills: updatedProfileData.skills || [],
          interests: updatedProfileData.interests || [],
          collaboration_pitch: updatedProfileData.collaboration_pitch || null,
          location: updatedProfileData.location || null,
          field_of_study: updatedProfileData.field_of_study || null,
          availability: updatedProfileData.availability as Profile['availability'] || 'full-time',
          education: updatedProfileData.education ?? null,
          visibility: updatedProfileData.visibility as Profile['visibility'] ?? 'public',
        };
         setProfile(profileForStore);
      } else if (!upsertError) {
        console.warn('Profile upsert successful but no data returned.');
      }
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const TagInput: React.FC<{
    label: string;
    tags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    placeholder?: string;
  }> = ({ label, tags, onAddTag, onRemoveTag, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue) {
        e.preventDefault();
        onAddTag(inputValue);
        setInputValue('');
      }
    };

    const commonLabelClass = "block text-sm font-medium text-neutral-300 mb-1.5 font-sans";
    const commonInputClass = "flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 font-sans";

    return (
      <div>
        <label className={commonLabelClass}>{label}</label>
        <div className="flex flex-wrap gap-2 items-center p-2 border border-neutral-700 rounded-md bg-neutral-800">
          {tags.map((tag, index) => (
            <span key={index} className="flex items-center bg-neutral-700 text-sm text-neutral-200 px-2 py-1 rounded">
              {tag}
              <button type="button" onClick={() => onRemoveTag(tag)} className="ml-2 text-neutral-400 hover:text-red-400">
                <FiX size={14} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Add a tag...'}
            className="flex-grow bg-transparent text-sm text-neutral-100 outline-none placeholder:text-neutral-500 min-w-[100px]"
          />
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-neutral-100 max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {error && (
        <div className="rounded-md bg-red-900/30 p-4 border border-red-700">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-400">Error saving profile</h3>
              <div className="mt-2 text-sm text-red-500">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {success && (
         <div className="rounded-md bg-green-900/30 p-4 border border-green-700">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiCheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-400">{success}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 flex flex-col items-center">
        <Avatar src={avatarPreview} alt="Profile Avatar" size={128} fallbackIcon={<FiUser size={64} />} />
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleAvatarChange} 
          className="hidden" 
          ref={fileInputRef}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="bg-neutral-700 hover:bg-neutral-600 border-neutral-600 text-neutral-200"
        >
          <FiUpload className="mr-2" /> Upload Avatar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="e.g., Dr. Jane Doe"
            required
          />
        </div>
        <div>
          <Input
            label="Field of Study / Specialization"
            name="field_of_study"
            value={formData.field_of_study}
            onChange={handleInputChange}
            placeholder="e.g., Computational Neuroscience"
          />
        </div>
        <div>
          <Input
            label="Institution / Affiliation"
            name="institution"
            value={formData.institution}
            onChange={handleInputChange}
            placeholder="e.g., University of Research"
          />
        </div>
        <div className="md:col-span-2">
          <Textarea
            label="Bio / Professional Summary"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself, your research, and your collaboration goals."
            rows={4}
          />
        </div>
        <div>
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., San Francisco, CA or Remote"
          />
        </div>
        <div>
          <Input
            label="Website / Portfolio URL"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://your-research-page.com"
          />
        </div>
        <div className="md:col-span-2">
          <TagInput
            label="Research Interests"
            tags={formData.research_interests}
            onAddTag={(tag) => setFormData(prev => ({ ...prev, research_interests: [...prev.research_interests, tag] }))}
            onRemoveTag={(tagToRemove) => setFormData(prev => ({ ...prev, research_interests: prev.research_interests.filter(tag => tag !== tagToRemove) }))}
            placeholder="Add interest (e.g., AI, Climate Change) and press Enter"
          />
        </div>
        <div className="md:col-span-2">
          <TagInput
            label="Skills"
            tags={formData.skills}
            onAddTag={(tag) => setFormData(prev => ({ ...prev, skills: [...prev.skills, tag] }))}
            onRemoveTag={(tagToRemove) => setFormData(prev => ({ ...prev, skills: prev.skills.filter(tag => tag !== tagToRemove) }))}
            placeholder="Add skill (e.g., Python, Data Analysis) and press Enter"
          />
        </div>
        <div className="md:col-span-2">
          <Textarea
            label="Collaboration Pitch / What You're Looking For"
            name="collaboration_pitch"
            value={formData.collaboration_pitch}
            onChange={handleInputChange}
            placeholder="Describe the type of collaborations or projects you are interested in."
            rows={3}
          />
        </div>
        <div className="col-span-1">
           <Select
             label="Availability"
             name="availability"
             id="availability"
             value={formData.availability}
             onChange={(e) => handleSelectChange('availability', e.target.value)}
             options={[
               { value: 'full-time', label: 'Full-time' },
               { value: 'part-time', label: 'Part-time' },
               { value: 'weekends', label: 'Weekends' },
               { value: 'not-available', label: 'Not Available' },
             ]}
             placeholder="Select availability"
             className="mt-1"
           />
        </div>
        <div className="md:col-span-2">
            <Textarea
                label="Education (JSON format)"
                name="education_json"
                value={formData.education_json}
                onChange={handleInputChange}
                placeholder='[{"degree": "PhD", "field": "Physics", "institution": "MIT", "year": 2020}]'
                rows={5}
                className="font-mono text-sm"
            />
            <p className="mt-1 text-xs text-neutral-400">
                Enter as a JSON array of objects. Each object can have keys like "degree", "field", "institution", "year".
            </p>
        </div>
        <div className="col-span-1 md:col-span-2">
           <Select
             label="Profile Visibility"
             name="visibility"
             id="visibility"
             value={formData.visibility}
             onChange={(e) => handleSelectChange('visibility', e.target.value)}
             options={[
               { value: 'public', label: 'Public (Visible to everyone)' },
               { value: 'private', label: 'Private (Only you can see your full profile)' },
               { value: 'connections', label: 'Connections Only (Visible to your connections)' },
             ]}
             placeholder="Select visibility"
             className="mt-1"
           />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-8 border-t border-neutral-700 mt-8">
        <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()} 
            className="bg-neutral-700 hover:bg-neutral-600 border-neutral-600 text-neutral-200"
            disabled={loading}
        >
          Cancel
        </Button>
        <Button 
            type="submit" 
            variant="default" 
            className="bg-accent-purple hover:bg-accent-purple-hover text-white"
            disabled={loading}
        >
          {loading ? (
            <>
              <FiLoader className="animate-spin mr-2" /> Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2" /> Save Profile
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 