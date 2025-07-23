'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/lib/store'
import { uploadAvatar } from '@/lib/api'
import { type Profile } from '@research-collab/db'
import { FiUser, FiUpload, FiAlertCircle, FiCheckCircle, FiX, FiSave, FiPlusCircle, FiTrash2, FiLoader } from 'react-icons/fi'
import { Avatar } from '@/components/ui/Avatar'
import { api } from '@/lib/trpc'

interface ProfileFormData {
  full_name: string;
  title: string;
  bio: string;
  institution: string;
  research_interests: string[];
  skills: string[];
  looking_for: string[];
  collaboration_pitch: string;
  location: string;
  field_of_study: string;
  availability: 'full-time' | 'part-time' | 'weekends' | 'not-available';
  availability_hours: number | string;
  project_preference: string;
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
    return jsonString;
  }
};

export function ProfileForm({ initialData, onProfileUpdate }: ProfileFormProps) {
  const router = useRouter()
  // supabase is already imported as a singleton
  const { user, profile: authProfile, setProfile } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ProfileFormData>(() => ({
    full_name: initialData?.full_name || authProfile?.full_name || '',
    title: initialData?.title || authProfile?.title || '',
    bio: initialData?.bio || authProfile?.bio || '',
    institution: initialData?.institution || authProfile?.institution || '',
    research_interests: initialData?.interests || authProfile?.interests || [],
    skills: initialData?.skills || authProfile?.skills || [],
    looking_for: initialData?.looking_for || authProfile?.looking_for || [],
    collaboration_pitch: initialData?.collaboration_pitch || authProfile?.collaboration_pitch || '',
    location: initialData?.location || authProfile?.location || '',
    field_of_study: initialData?.field_of_study || authProfile?.field_of_study || '',
    availability: initialData?.availability || authProfile?.availability || 'full-time',
    availability_hours: initialData?.availability_hours || authProfile?.availability_hours || 0,
    project_preference: initialData?.project_preference || authProfile?.project_preference || '',
    visibility: initialData?.visibility || authProfile?.visibility || 'public',
    website: initialData?.website || authProfile?.website || '',
    education_json: formatJsonString(initialData?.education as string || authProfile?.education as string),
  }))

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar_url || authProfile?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentProfileSource = initialData || authProfile;
    if (currentProfileSource) {
        setFormData({
            full_name: currentProfileSource.full_name || '',
            title: currentProfileSource.title || '',
            bio: currentProfileSource.bio || '',
            institution: currentProfileSource.institution || '',
            research_interests: currentProfileSource.interests || [], 
            skills: currentProfileSource.skills || [],
            looking_for: currentProfileSource.looking_for || [],
            collaboration_pitch: currentProfileSource.collaboration_pitch || '',
            location: currentProfileSource.location || '',
            field_of_study: currentProfileSource.field_of_study || '',
            availability: currentProfileSource.availability || 'full-time',
            availability_hours: currentProfileSource.availability_hours || 0,
            project_preference: currentProfileSource.project_preference || '',
            visibility: currentProfileSource.visibility || 'public',
            website: currentProfileSource.website || '',
            education_json: formatJsonString(currentProfileSource.education as string),
        });
        if (currentProfileSource.avatar_url) {
            setAvatarPreview(currentProfileSource.avatar_url);
        }
    }
  }, [initialData, authProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'availability_hours' ? parseInt(value, 10) || 0 : value }));
  };
  
  const handleSelectChange = (name: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const updateProfileMutation = api.profile.update.useMutation({
    onMutate: async (newProfileData) => {
      // Snapshot the previous value
      const previousProfile = authProfile;

      // Optimistically update the store
      // We merge the existing profile with the new data to form the optimistic profile
      if (previousProfile) {
        const optimisticProfile = { ...previousProfile, ...newProfileData };
        setProfile(optimisticProfile as Profile);
      }
      
      setSuccess('Saving...');
      setError(null);

      // Return a context object with the snapshotted value
      return { previousProfile };
    },
    onError: (err, newProfile, context) => {
      // Rollback to the previous value if mutation fails
      if (context?.previousProfile) {
        setProfile(context.previousProfile);
      }
      setError(err.message);
      setSuccess(null);
    },
    onSuccess: (data) => {
      // On success, the server returns the definitive data.
      // We update the store with this confirmed data.
      setProfile(data);
      setSuccess('Profile saved successfully!');
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      router.refresh(); // Or invalidate a specific query if preferred
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('Not authenticated');
      return;
    }

    // Validate required fields
    if (!formData.bio || formData.bio.trim().length === 0) {
      setError('Bio is required.');
      return;
    }

    try {
      let newAvatarUrl = avatarPreview;
      if (avatarFile) {
        const uploadResult = await uploadAvatar(user.id, avatarFile);
        newAvatarUrl = uploadResult?.url ?? newAvatarUrl;
      }
      
      let educationDataToSave: any = null;
      try {
        educationDataToSave = formData.education_json ? JSON.parse(formData.education_json) : null;
      } catch (jsonError) {
        throw new Error('Education data is not valid JSON.');
      }

      const nameParts = formData.full_name.trim().split(/\s+/);

      const profileDataToSave = {
        full_name: formData.full_name.trim(),
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        title: formData.title,
        bio: formData.bio,
        institution: formData.institution,
        interests: formData.research_interests, 
        skills: formData.skills,
        looking_for: formData.looking_for,
        collaboration_pitch: formData.collaboration_pitch,
        location: formData.location,
        field_of_study: formData.field_of_study,
        availability: formData.availability as Profile['availability'],
        availability_hours: Number(formData.availability_hours) || undefined,
        project_preference: formData.project_preference,
        visibility: formData.visibility as Profile['visibility'],
        website: formData.website,
        education: educationDataToSave,
        avatar_url: newAvatarUrl,
      };

      updateProfileMutation.mutate(profileDataToSave);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      updateProfileMutation.reset();
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
    return (
      <div>
        <label className={commonLabelClass}>{label}</label>
        <div className="flex items-center mb-2">
          <Input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder={placeholder || `Add ${label.toLowerCase()} and press Enter`}
            className={`${commonInputClass} mr-2`}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => { if(inputValue) { onAddTag(inputValue); setInputValue('');}}}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className={tagClass}>
              {tag}
              <button type="button" onClick={() => onRemoveTag(tag)} className={tagRemoveButtonClass} aria-label={`Remove ${tag}`}>
                <FiX size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };

  const commonLabelClass = "block text-sm font-medium text-gray-200 mb-1.5";
  const commonInputClass = "w-full bg-neutral-800 border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm";
  const tagClass = "flex items-center bg-indigo-600/80 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-indigo-500/60 shadow-sm";
  const tagRemoveButtonClass = "ml-2 text-indigo-200 hover:text-white focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-neutral-100">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-neutral-700/50 backdrop-blur-md border border-neutral-600/50 flex items-center justify-center overflow-hidden shadow-lg">
            <Avatar 
              src={avatarPreview} 
              alt="Profile Avatar" 
              size="xl"
              fallback={<FiUser className="text-gray-400" size={60} />}
            />
          </div>
           <Button
            type="button"
            variant="glass"
            size="sm"
            className="absolute -bottom-2 -right-2 !p-2 rounded-full shadow-md bg-neutral-800 hover:bg-neutral-700 border border-neutral-600"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Change profile photo"
          >
            <FiUpload size={16} />
          </Button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleAvatarChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="full_name" className={commonLabelClass}>Full Name</label>
          <Input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleInputChange} className={commonInputClass} placeholder="e.g., Dr. Jane Doe" />
        </div>
        <div>
          <label htmlFor="title" className={commonLabelClass}>Title/Headline</label>
          <Input id="title" name="title" type="text" value={formData.title} onChange={handleInputChange} className={commonInputClass} placeholder="e.g., Professor of Astrophysics, AI Researcher" />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className={commonLabelClass}>Bio <span className="text-red-500">*</span></label>
        <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} className={`${commonInputClass} min-h-[100px]`} placeholder="Tell us a bit about yourself, your research, and what you're passionate about." minLength={1} required />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="institution" className={commonLabelClass}>Institution/Affiliation</label>
          <Input id="institution" name="institution" type="text" value={formData.institution} onChange={handleInputChange} className={commonInputClass} placeholder="e.g., University of Research" />
        </div>
        <div>
          <label htmlFor="location" className={commonLabelClass}>Location</label>
          <Input id="location" name="location" type="text" value={formData.location} onChange={handleInputChange} className={commonInputClass} placeholder="e.g., City, Country" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
          <label htmlFor="field_of_study" className={commonLabelClass}>Primary Field of Study</label>
          <Input id="field_of_study" name="field_of_study" type="text" value={formData.field_of_study} onChange={handleInputChange} className={commonInputClass} placeholder="e.g., Computer Science, Marine Biology" />
        </div>
        <div>
          <label htmlFor="website" className={commonLabelClass}>Website/Portfolio Link</label>
          <Input id="website" name="website" type="url" value={formData.website} onChange={handleInputChange} className={commonInputClass} placeholder="https://your-research-profile.com" />
        </div>
      </div>

      <div>
        <label htmlFor="collaboration_pitch" className={commonLabelClass}>Collaboration Pitch</label>
        <Textarea id="collaboration_pitch" name="collaboration_pitch" value={formData.collaboration_pitch} onChange={handleInputChange} className={`${commonInputClass} min-h-[80px]`} placeholder="What kind of projects are you looking to collaborate on? What can you bring to a team?" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label htmlFor="availability" className={commonLabelClass}>Availability</label>
          <Select value={formData.availability} onValueChange={(value) => handleSelectChange('availability', value)}>
            <SelectTrigger className={commonInputClass} id="availability"><SelectValue placeholder="Select availability" /></SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="weekends">Weekends only</SelectItem>
              <SelectItem value="not-available">Not currently available</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="availability_hours" className={commonLabelClass}>Weekly Availability (Hours)</label>
          <Input id="availability_hours" name="availability_hours" type="number" value={formData.availability_hours} onChange={handleInputChange} className={commonInputClass} placeholder="e.g., 10" min="0" />
        </div>
         <div>
          <label htmlFor="project_preference" className={commonLabelClass}>Project Preference</label>
          <Input id="project_preference" name="project_preference" type="text" value={formData.project_preference} onChange={handleInputChange} className={commonInputClass} placeholder="e.g., Short-term, Long-term, Specific topics" />
        </div>
      </div>

      <TagInput 
        label="Research Interests" 
        tags={formData.research_interests} 
        onAddTag={(tag) => setFormData(prev => ({ ...prev, research_interests: [...prev.research_interests, tag] }))}
        onRemoveTag={(tag) => setFormData(prev => ({ ...prev, research_interests: prev.research_interests.filter(i => i !== tag) }))}
        placeholder="Add an interest (e.g., AI Ethics)"
      />
      <TagInput 
        label="Skills"
        tags={formData.skills} 
        onAddTag={(tag) => setFormData(prev => ({ ...prev, skills: [...prev.skills, tag] }))}
        onRemoveTag={(tag) => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== tag) }))}
        placeholder="Add a skill (e.g., Python, Data Analysis)"
      />
      <TagInput 
        label="Looking For (Collaboration Types/Roles)"
        tags={formData.looking_for} 
        onAddTag={(tag) => setFormData(prev => ({ ...prev, looking_for: [...prev.looking_for, tag] }))}
        onRemoveTag={(tag) => setFormData(prev => ({ ...prev, looking_for: prev.looking_for.filter(l => l !== tag) }))}
        placeholder="Add what you're seeking (e.g., Co-author, Data Sharing)"
      />

      <div>
        <label htmlFor="education_json" className={commonLabelClass}>Education History (JSON format)</label>
        <Textarea 
          id="education_json" 
          name="education_json" 
          value={formData.education_json} 
          onChange={handleInputChange} 
          className={`${commonInputClass} min-h-[120px] font-mono text-sm`}
          placeholder={'Example: [\n  {\n    "institution": "University of Science",\n    "degree": "PhD in Physics",\n    "year": 2020\n  }\n]'}
        />
        <p className="text-xs text-neutral-500 mt-1">Enter as a JSON array of objects. Each object should have institution, degree, and year.</p>
      </div>

      <div>
        <label htmlFor="visibility" className={commonLabelClass}>Profile Visibility</label>
        <Select value={formData.visibility} onValueChange={(value) => handleSelectChange('visibility', value)}>
          <SelectTrigger className={commonInputClass} id="visibility"><SelectValue placeholder="Select visibility" /></SelectTrigger>
          <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
            <SelectItem value="public">Public (Visible to everyone)</SelectItem>
            <SelectItem value="connections">Connections Only (Not yet implemented)</SelectItem>
            <SelectItem value="private">Private (Only you can see)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-6 border-t border-neutral-800">
        {error && (
          <div className="mb-4 flex items-center text-red-400 bg-red-900/30 p-3 rounded-md border border-red-700/50">
            <FiAlertCircle className="mr-2 flex-shrink-0" size={20}/> 
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center text-green-300 bg-green-800/30 p-3 rounded-md border border-green-600/50">
            <FiCheckCircle className="mr-2 flex-shrink-0" size={20}/> 
            <span className="text-sm">{success}</span>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-8">
            <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={updateProfileMutation.isPending}
            >
                <FiX className="mr-2" />
                Cancel
            </Button>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? (
                    <FiLoader className="mr-2 animate-spin" />
                ) : (
                    <FiSave className="mr-2" />
                )}
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
        </div>
      </div>
    </form>
  )
} 