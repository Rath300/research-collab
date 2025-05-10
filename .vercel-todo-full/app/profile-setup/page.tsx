'use client';

import { useState } from 'react';
import { z } from 'zod';
import { PageContainer } from '../../components';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Define schema for profile form validation
const profileSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  title: z.string().min(2, 'Professional title is required'),
  bio: z.string().min(10, 'Bio should be at least 10 characters').max(500, 'Bio should not exceed 500 characters'),
  location: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  skills: z.array(z.string()).min(1, 'Please select at least one skill'),
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
  lookingFor: z.array(z.string()).min(1, 'Please select at least one option'),
  availabilityHours: z.number().min(1).max(40),
  projectPreference: z.enum(['remote', 'local', 'hybrid']),
  profileVisibility: z.enum(['public', 'private']),
  avatarUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Skill categories with skills
const SKILL_CATEGORIES = [
  {
    name: 'Research',
    skills: ['Data Analysis', 'Literature Review', 'Experimental Design', 'Survey Design', 'Qualitative Research', 'Quantitative Research']
  },
  {
    name: 'Technical',
    skills: ['Web Development', 'Mobile App Development', 'Data Science', 'Machine Learning', 'UI/UX Design', 'Database Management']
  },
  {
    name: 'Academic',
    skills: ['Academic Writing', 'Peer Review', 'Grant Writing', 'Teaching', 'Public Speaking', 'Statistical Analysis']
  },
  {
    name: 'Creative',
    skills: ['Graphic Design', 'Video Production', 'Content Creation', 'Copywriting', 'Visual Storytelling', 'Social Media']
  },
];

// Interest areas
const INTEREST_AREAS = [
  'Artificial Intelligence',
  'Climate Change',
  'Public Health',
  'Education',
  'Social Sciences',
  'Renewable Energy',
  'Psychology',
  'Neuroscience',
  'Computer Science',
  'Economics',
  'Business',
  'Arts & Humanities',
  'Engineering',
  'Physics',
  'Chemistry',
  'Biology',
  'Medicine',
  'Environmental Science',
  'Political Science',
  'Law',
];

// Looking for options
const LOOKING_FOR_OPTIONS = [
  'Long-term collaboration',
  'Short-term project',
  'Co-authoring papers',
  'Research assistance',
  'Mentorship',
  'Programming help',
  'Data analysis',
  'Grant writing',
  'Peer review',
  'Networking',
];

export default function ProfileSetupPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    title: '',
    bio: '',
    location: '',
    website: '',
    skills: [],
    interests: [],
    lookingFor: [],
    availabilityHours: 10,
    projectPreference: 'remote',
    profileVisibility: 'public',
    avatarUrl: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('Research');

  const totalSteps = 4;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof ProfileFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => {
      const skillExists = prev.skills.includes(skill);
      if (skillExists) {
        return { ...prev, skills: prev.skills.filter(s => s !== skill) };
      } else {
        return { ...prev, skills: [...prev.skills, skill] };
      }
    });
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => {
      const interestExists = prev.interests.includes(interest);
      if (interestExists) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const toggleLookingFor = (option: string) => {
    setFormData(prev => {
      const optionExists = prev.lookingFor.includes(option);
      if (optionExists) {
        return { ...prev, lookingFor: prev.lookingFor.filter(o => o !== option) };
      } else {
        return { ...prev, lookingFor: [...prev.lookingFor, option] };
      }
    });
  };

  const validateCurrentStep = (): boolean => {
    let newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
    let isValid = true;

    switch (currentStep) {
      case 1: {
        // Validate personal info
        if (!formData.fullName) {
          newErrors.fullName = 'Name is required';
          isValid = false;
        }
        if (!formData.title) {
          newErrors.title = 'Professional title is required';
          isValid = false;
        }
        if (!formData.bio) {
          newErrors.bio = 'Bio is required';
          isValid = false;
        } else if (formData.bio.length < 10) {
          newErrors.bio = 'Bio should be at least 10 characters';
          isValid = false;
        } else if (formData.bio.length > 500) {
          newErrors.bio = 'Bio should not exceed 500 characters';
          isValid = false;
        }
        if (formData.website && !formData.website.startsWith('http')) {
          newErrors.website = 'Please enter a valid URL';
          isValid = false;
        }
        break;
      }
      case 2: {
        // Validate skills
        if (formData.skills.length === 0) {
          newErrors.skills = 'Please select at least one skill';
          isValid = false;
        }
        break;
      }
      case 3: {
        // Validate interests and looking for
        if (formData.interests.length === 0) {
          newErrors.interests = 'Please select at least one interest';
          isValid = false;
        }
        if (formData.lookingFor.length === 0) {
          newErrors.lookingFor = 'Please select at least one option';
          isValid = false;
        }
        break;
      }
      case 4: {
        // Validate preferences
        if (formData.availabilityHours < 1 || formData.availabilityHours > 40) {
          newErrors.availabilityHours = 'Hours must be between 1 and 40';
          isValid = false;
        }
        break;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const goToNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        handleSubmit();
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate the whole form
      const result = profileSchema.safeParse(formData);
      
      if (!result.success) {
        const formattedErrors: Partial<Record<keyof ProfileFormData, string>> = {};
        result.error.errors.forEach(err => {
          const path = err.path[0] as keyof ProfileFormData;
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
        setIsSubmitting(false);
        return;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      let profileId;
      
      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('profiles')
          .update({
        full_name: formData.fullName,
        title: formData.title,
        bio: formData.bio,
        location: formData.location || null,
        website: formData.website || null,
        skills: formData.skills,
        interests: formData.interests,
        looking_for: formData.lookingFor,
        availability_hours: formData.availabilityHours,
        project_preference: formData.projectPreference,
            visibility: formData.profileVisibility,
        avatar_url: formData.avatarUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        profileId = data.id;
      } else {
        // Create new profile
        const { data, error } = await supabase
        .from('profiles')
          .insert({
            user_id: user.id,
            full_name: formData.fullName,
            title: formData.title,
            bio: formData.bio,
            location: formData.location || null,
            website: formData.website || null,
            skills: formData.skills,
            interests: formData.interests,
            looking_for: formData.lookingFor,
            availability_hours: formData.availabilityHours,
            project_preference: formData.projectPreference,
            visibility: formData.profileVisibility,
            avatar_url: formData.avatarUrl || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
      
      if (error) {
        throw error;
      }
      
        profileId = data.id;
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // Improved error handling
      let errorMessage = 'Failed to save profile. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Failed to save profile: ${error.message}`;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error object
        const supabaseError = error as { message?: string, details?: string, hint?: string, code?: string };
        errorMessage = `Failed to save profile: ${supabaseError.message || supabaseError.details || 'Unknown error'}`;
        if (supabaseError.hint) {
          errorMessage += ` (Hint: ${supabaseError.hint})`;
        }
        if (supabaseError.code) {
          errorMessage += ` (Code: ${supabaseError.code})`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer title="Complete Your Profile">
      <div className="max-w-3xl mx-auto py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div 
                key={index} 
                className="flex items-center"
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep > index + 1 
                      ? 'bg-green-500 text-white' 
                      : currentStep === index + 1 
                      ? 'bg-researchbee-yellow text-black'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {currentStep > index + 1 ? '✓' : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div 
                    className={`h-1 w-16 mx-2 ${
                      currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span>Personal Info</span>
            <span>Skills</span>
            <span>Interests</span>
            <span>Preferences</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Set Up Your Profile</h1>
          
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleTextChange}
                    className={`w-full p-3 bg-gray-700 rounded-md border ${
                      errors.fullName ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Professional Title<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleTextChange}
                    className={`w-full p-3 bg-gray-700 rounded-md border ${
                      errors.title ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="e.g. Research Scientist, PhD Student, Data Analyst"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-1">
                    Bio<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleTextChange}
                    rows={4}
                    className={`w-full p-3 bg-gray-700 rounded-md border ${
                      errors.bio ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Tell others about yourself, your research interests, and experience"
                  ></textarea>
                  <p className="mt-1 text-sm text-gray-400">
                    {formData.bio.length}/500 characters
                  </p>
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleTextChange}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600"
                    placeholder="e.g. New York, USA"
                  />
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium mb-1">
                    Website or Portfolio
                  </label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleTextChange}
                    className={`w-full p-3 bg-gray-700 rounded-md border ${
                      errors.website ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-500">{errors.website}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Skills */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Skills</h2>
              <p className="text-gray-400 mb-6">
                Select the skills you have that would be valuable for collaboration.
              </p>
              
              {errors.skills && (
                <p className="mb-4 text-sm text-red-500">{errors.skills}</p>
              )}
              
              <div className="flex mb-4 border-b border-gray-700 overflow-x-auto">
                {SKILL_CATEGORIES.map(category => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedSkillCategory(category.name)}
                    className={`px-4 py-2 font-medium whitespace-nowrap ${
                      selectedSkillCategory === category.name 
                        ? 'border-b-2 border-researchbee-yellow text-researchbee-yellow' 
                        : 'text-gray-400'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SKILL_CATEGORIES.find(c => c.name === selectedSkillCategory)?.skills.map(skill => (
                  <div
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      formData.skills.includes(skill)
                        ? 'bg-researchbee-yellow text-black'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {skill}
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-3">Selected Skills ({formData.skills.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.length === 0 ? (
                    <p className="text-gray-400">No skills selected</p>
                  ) : (
                    formData.skills.map(skill => (
                      <div 
                        key={skill}
                        className="bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center"
                      >
                        {skill}
                        <button 
                          onClick={() => toggleSkill(skill)}
                          className="ml-2 text-gray-400 hover:text-white"
                        >
                          &times;
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Interests and What You're Looking For */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Interests & Goals</h2>
              
              <div className="mb-8">
                <h3 className="font-medium mb-3">Research Interests</h3>
                <p className="text-gray-400 mb-4">
                  Select areas you're interested in researching or collaborating on.
                </p>
                
                {errors.interests && (
                  <p className="mb-4 text-sm text-red-500">{errors.interests}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {INTEREST_AREAS.map(interest => (
                    <div
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        formData.interests.includes(interest)
                          ? 'bg-researchbee-yellow text-black'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {interest}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Selected Interests ({formData.interests.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.length === 0 ? (
                      <p className="text-gray-400">No interests selected</p>
                    ) : (
                      formData.interests.map(interest => (
                        <div 
                          key={interest}
                          className="bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center"
                        >
                          {interest}
                          <button 
                            onClick={() => toggleInterest(interest)}
                            className="ml-2 text-gray-400 hover:text-white"
                          >
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">What You're Looking For</h3>
                <p className="text-gray-400 mb-4">
                  Select what type of collaboration you're seeking.
                </p>
                
                {errors.lookingFor && (
                  <p className="mb-4 text-sm text-red-500">{errors.lookingFor}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {LOOKING_FOR_OPTIONS.map(option => (
                    <div
                      key={option}
                      onClick={() => toggleLookingFor(option)}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        formData.lookingFor.includes(option)
                          ? 'bg-researchbee-yellow text-black'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="availabilityHours" className="block text-sm font-medium mb-1">
                    Weekly Availability (hours)
                  </label>
                  <input
                    type="number"
                    id="availabilityHours"
                    name="availabilityHours"
                    value={formData.availabilityHours}
                    onChange={handleNumberChange}
                    min="1"
                    max="40"
                    className={`w-full p-3 bg-gray-700 rounded-md border ${
                      errors.availabilityHours ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  <p className="mt-1 text-sm text-gray-400">
                    How many hours per week can you dedicate to collaboration?
                  </p>
                  {errors.availabilityHours && (
                    <p className="mt-1 text-sm text-red-500">{errors.availabilityHours}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="projectPreference" className="block text-sm font-medium mb-1">
                    Project Location Preference
                  </label>
                  <select
                    id="projectPreference"
                    name="projectPreference"
                    value={formData.projectPreference}
                    onChange={handleSelectChange}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600"
                  >
                    <option value="remote">Remote Only</option>
                    <option value="local">Local Only</option>
                    <option value="hybrid">Hybrid (Remote & Local)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="profileVisibility" className="block text-sm font-medium mb-1">
                    Profile Visibility
                  </label>
                  <select
                    id="profileVisibility"
                    name="profileVisibility"
                    value={formData.profileVisibility}
                    onChange={handleSelectChange}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600"
                  >
                    <option value="public">Public - Anyone can view your profile</option>
                    <option value="private">Private - Only matched users can view your profile</option>
                  </select>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Profile Summary</h3>
                  <div className="text-sm space-y-2">
                    <p><span className="text-gray-400">Name:</span> {formData.fullName}</p>
                    <p><span className="text-gray-400">Title:</span> {formData.title}</p>
                    <p><span className="text-gray-400">Skills:</span> {formData.skills.length} selected</p>
                    <p><span className="text-gray-400">Interests:</span> {formData.interests.length} selected</p>
                    <p><span className="text-gray-400">Looking for:</span> {formData.lookingFor.length} selected</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
              <button
                onClick={goToPreviousStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-md ${
                currentStep === 1
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              >
              Back
              </button>
            
              <button
                onClick={goToNextStep}
                disabled={isSubmitting}
              className="bg-researchbee-yellow text-black px-6 py-2 rounded-md hover:bg-yellow-500 flex items-center"
              >
              {isSubmitting && (
                <div className="mr-2 h-4 w-4 border-2 border-black border-t-transparent animate-spin rounded-full"></div>
              )}
              {currentStep < totalSteps ? 'Next' : 'Complete Profile'}
              </button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
            Skip for now (you can complete this later)
          </Link>
        </div>
      </div>
    </PageContainer>
  );
} 