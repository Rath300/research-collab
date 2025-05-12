'use client'

import { useState, useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useAuthStore } from '@/lib/store'
import { uploadAvatar } from '@/lib/api'
import { type Profile } from '@research-collab/db'
import { FiUser, FiUpload, FiAlertCircle, FiCheckCircle, FiX, FiSave } from 'react-icons/fi'
import { Avatar } from '@/components/ui/Avatar'

interface ProfileFormProps {
  initialData?: {
    full_name?: string | null
    bio?: string | null
    institution?: string | null
    research_interests?: string[] | null
    skills?: string[] | null
    collaboration_pitch?: string | null
    avatar_url?: string | null
    location?: string | null
    field_of_study?: string | null
    availability?: 'full-time' | 'part-time' | 'weekends' | 'not-available' | null
    website?: string | null
  }
  onProfileUpdate?: () => void
}

export function ProfileForm({ initialData, onProfileUpdate }: ProfileFormProps) {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const { user, setProfile } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || '',
    bio: initialData?.bio || '',
    institution: initialData?.institution || '',
    research_interests: initialData?.research_interests || [],
    skills: initialData?.skills || [],
    collaboration_pitch: initialData?.collaboration_pitch || '',
    location: initialData?.location || '',
    field_of_study: initialData?.field_of_study || '',
    availability: initialData?.availability || 'full-time',
    website: initialData?.website || '',
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
        setFormData({
            full_name: initialData.full_name || '',
            bio: initialData.bio || '',
            institution: initialData.institution || '',
            research_interests: initialData.research_interests || [],
            skills: initialData.skills || [],
            collaboration_pitch: initialData.collaboration_pitch || '',
            location: initialData.location || '',
            field_of_study: initialData.field_of_study || '',
            availability: initialData.availability || 'full-time',
            website: initialData.website || '',
        });
        if (initialData.avatar_url) {
            setAvatarPreview(initialData.avatar_url);
        }
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
      
      const profileDataToSave = {
        id: user.id,
        user_id: user.id, 
        first_name: firstName,
        last_name: lastName,
        bio: formData.bio,
        institution: formData.institution,
        interests: formData.research_interests, 
        skills: formData.skills,
        collaboration_pitch: formData.collaboration_pitch,
        location: formData.location,
        field_of_study: formData.field_of_study,
        availability: formData.availability,
        website: formData.website,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString()
      };

      const { data: updatedProfileData, error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileDataToSave)
        .select('id, user_id, first_name, last_name, email, avatar_url, institution, bio, website, skills, interests, collaboration_pitch, location, field_of_study, availability, updated_at')
        .single();

      if (upsertError) throw upsertError

      setSuccess('Profile saved successfully!');
      if (updatedProfileData) {
        const profileForStore: Profile = {
          id: updatedProfileData.id,
          user_id: updatedProfileData.user_id,
          first_name: updatedProfileData.first_name ?? null,
          last_name: updatedProfileData.last_name ?? null,
          email: updatedProfileData.email ?? null,
          avatar_url: updatedProfileData.avatar_url ?? null,
          institution: updatedProfileData.institution ?? null,
          bio: updatedProfileData.bio ?? null,
          website: updatedProfileData.website ?? null,
          skills: updatedProfileData.skills ?? [],
          interests: updatedProfileData.interests ?? [],
          collaboration_pitch: updatedProfileData.collaboration_pitch ?? null,
          location: updatedProfileData.location ?? null,
          field_of_study: updatedProfileData.field_of_study ?? null,
          availability: updatedProfileData.availability as Profile['availability'],
          updated_at: updatedProfileData.updated_at ? new Date(updatedProfileData.updated_at) : null,
        };
         setProfile(profileForStore);
      } else if (!upsertError) {
        console.warn('Profile upsert successful but no data returned.');
      }
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInterestAdd = (interest: string) => {
    const trimmedInterest = interest.trim();
    if (trimmedInterest && !formData.research_interests.includes(trimmedInterest)) {
      setFormData(prev => ({
        ...prev,
        research_interests: [...prev.research_interests, trimmedInterest]
      }))
    }
  }

  const handleInterestRemove = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      research_interests: prev.research_interests.filter(i => i !== interest)
    }))
  }

  const handleSkillAdd = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill]
      }))
    }
  }

  const handleSkillRemove = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }
  
  const commonLabelClass = "block text-sm font-medium text-gray-200 mb-1.5";
  const commonInputClass = "w-full";
  const tagClass = "flex items-center bg-purple-600/70 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-purple-500/50 shadow-sm";
  const tagRemoveButtonClass = "ml-2 text-purple-200 hover:text-white focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
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
            className="absolute -bottom-2 -right-2 !p-2 rounded-full shadow-md"
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

      {error && (
        <div className="p-3 bg-red-600/40 border border-red-500/60 rounded-lg text-white text-sm backdrop-blur-sm flex items-center space-x-2">
            <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-600/40 border border-green-500/60 rounded-lg text-white text-sm backdrop-blur-sm flex items-center space-x-2">
            <FiCheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <div>
          <label htmlFor="full_name" className={commonLabelClass}>Full Name</label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            required
            placeholder="e.g., Ada Lovelace"
            className={commonInputClass}
          />
        </div>
        <div>
          <label htmlFor="institution" className={commonLabelClass}>Institution</label>
          <Input
            id="institution"
            name="institution"
            value={formData.institution}
            onChange={handleInputChange}
            placeholder="e.g., University of Research"
            className={commonInputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className={commonLabelClass}>Bio</label>
        <Input
          id="bio"
          name="bio"
          type="textarea"
          value={formData.bio}
          onChange={handleInputChange}
          placeholder="Tell us about yourself, your research, and what you're looking for..."
          rows={4}
          className={commonInputClass}
        />
      </div>

      <div>
        <label htmlFor="collaboration_pitch" className={commonLabelClass}>Collaboration Pitch / Top Project Idea</label>
        <Input
          id="collaboration_pitch"
          name="collaboration_pitch"
          type="textarea"
          value={formData.collaboration_pitch}
          onChange={handleInputChange}
          placeholder="Describe a project you'd love to collaborate on, or an idea you're passionate about (max 1000 chars)."
          rows={5}
          maxLength={1000}
          className={commonInputClass}
        />
        <p className="text-xs text-gray-400 mt-1">This will be shown to others in profile matching.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <div>
          <label htmlFor="location" className={commonLabelClass}>Location</label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., London, UK"
            className={commonInputClass}
          />
        </div>
        <div>
          <label htmlFor="field_of_study" className={commonLabelClass}>Primary Field of Study</label>
          <Input
            id="field_of_study"
            name="field_of_study"
            value={formData.field_of_study}
            onChange={handleInputChange}
            placeholder="e.g., Computational Linguistics"
            className={commonInputClass}
          />
        </div>
      </div>
      
      <div>
          <label htmlFor="website" className={commonLabelClass}>Website/Portfolio</label>
          <Input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://your.personal.page"
            className={commonInputClass}
          />
      </div>

      <div>
        <label htmlFor="availability" className={commonLabelClass}>Availability for Collaboration</label>
        <select
          id="availability"
          name="availability"
          value={formData.availability}
          onChange={handleInputChange}
          className="w-full mt-1 block rounded-lg border bg-white/5 backdrop-blur-sm px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-400 caret-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out border-white/20 hover:border-white/40 h-11"
        >
          <option value="full-time" className="bg-gray-800 text-white">Full Time</option>
          <option value="part-time" className="bg-gray-800 text-white">Part Time</option>
          <option value="weekends" className="bg-gray-800 text-white">Weekends Only</option>
          <option value="not-available" className="bg-gray-800 text-white">Not Currently Available</option>
        </select>
      </div>

      <div>
        <label className={commonLabelClass}>Skills (Tags)</label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[2.5rem]">
          {(formData.skills || []).map(skill => (
            <span
              key={skill}
              className={tagClass}
            >
              {skill}
              <button
                type="button"
                onClick={() => handleSkillRemove(skill)}
                className={tagRemoveButtonClass}
                aria-label={`Remove ${skill}`}
              >
                <FiX size={14} />
              </button>
            </span>
          ))}
        </div>
        <Input
          placeholder="Add a skill and press Enter"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const target = e.target as HTMLInputElement;
              if (target.value.trim()) {
                handleSkillAdd(target.value.trim());
                target.value = '';
              }
            }
          }}
          className={commonInputClass}
        />
         <p className="text-xs text-gray-400 mt-1">Clearly list your key skills (e.g., Python, Data Analysis, Grant Writing).</p>
      </div>

      <div>
        <label className={commonLabelClass}>Research Interests (Tags)</label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[2.5rem]">
          {(formData.research_interests || []).map(interest => (
            <span
              key={interest}
              className={tagClass}
            >
              {interest}
              <button
                type="button"
                onClick={() => handleInterestRemove(interest)}
                className={tagRemoveButtonClass}
                aria-label={`Remove ${interest}`}
              >
                <FiX size={14} />
              </button>
            </span>
          ))}
        </div>
        <Input
          placeholder="Add an interest and press Enter"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const target = e.target as HTMLInputElement;
              if (target.value.trim()) {
                handleInterestAdd(target.value.trim());
                target.value = '';
              }
            }
          }}
          className={commonInputClass}
        />
         <p className="text-xs text-gray-400 mt-1">Add relevant keywords or phrases for your research.</p>
      </div>
      
      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          isFullWidth={true}
          leftIcon={<FiSave size={18} />}
          className="transform hover:scale-105 active:scale-95"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
} 