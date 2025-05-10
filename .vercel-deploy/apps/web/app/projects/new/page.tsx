'use client';

import { useState } from 'react';
import { z } from 'zod';
import { PageContainer } from '../../../components';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Define schema for project form validation
const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(1, 'Please select a category'),
  skillsNeeded: z.array(z.string()).min(1, 'Please select at least one skill needed'),
  collaborationType: z.enum(['remote', 'local', 'hybrid']),
  duration: z.enum(['short_term', 'medium_term', 'long_term']),
  commitment: z.number().min(1).max(40),
  isPublic: z.boolean(),
  location: z.string().optional(),
  deadline: z.string().optional(),
  links: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

// Categories for projects
const PROJECT_CATEGORIES = [
  'Research Study',
  'Academic Paper',
  'Software Development',
  'Data Analysis',
  'Literature Review',
  'Creative Project',
  'Educational Initiative',
  'Community Service',
  'Business Venture',
  'Other',
];

// Skills that might be needed for projects
const SKILLS_NEEDED = [
  // Research Skills
  'Data Analysis',
  'Literature Review',
  'Survey Design',
  'Qualitative Research',
  'Quantitative Research',
  'Statistical Analysis',
  
  // Technical Skills
  'Web Development',
  'Mobile App Development',
  'Data Science',
  'Machine Learning',
  'UI/UX Design',
  'Database Management',
  
  // Academic Skills
  'Academic Writing',
  'Peer Review',
  'Grant Writing',
  'Teaching',
  'Public Speaking',
  
  // Creative Skills
  'Graphic Design',
  'Video Production',
  'Content Creation',
  'Copywriting',
  'Visual Storytelling',
  'Social Media',
];

export default function NewProjectPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    category: '',
    skillsNeeded: [],
    collaborationType: 'remote',
    duration: 'medium_term',
    commitment: 5,
    isPublic: true,
    location: '',
    deadline: '',
    links: [],
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof ProjectFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user selects
    if (errors[name as keyof ProjectFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const toggleSkill = (skill: string) => {
    setFormData(prev => {
      const skillExists = prev.skillsNeeded.includes(skill);
      if (skillExists) {
        return { ...prev, skillsNeeded: prev.skillsNeeded.filter(s => s !== skill) };
      } else {
        return { ...prev, skillsNeeded: [...prev.skillsNeeded, skill] };
      }
    });
    // Clear error when user selects a skill
    if (errors.skillsNeeded) {
      setErrors(prev => ({ ...prev, skillsNeeded: '' }));
    }
  };
  
  const addLink = () => {
    if (!linkInput.trim()) return;
    
    // Simple URL validation
    let url = linkInput.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    setFormData(prev => ({
      ...prev,
      links: [...(prev.links || []), url],
    }));
    setLinkInput('');
  };
  
  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links?.filter((_, i) => i !== index) || [],
    }));
  };
  
  const validateForm = () => {
    try {
      projectSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Partial<Record<keyof ProjectFormData, string>> = {};
        error.errors.forEach(err => {
          const path = err.path[0] as keyof ProjectFormData;
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Attempting to create project for user:', user.id);
      
      // Prepare project data
      const projectData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills_needed: formData.skillsNeeded,
        collaboration_type: formData.collaborationType,
        duration: formData.duration,
        commitment_hours: formData.commitment,
        is_public: formData.isPublic,
        location: formData.location || null,
        deadline: formData.deadline || null,
        links: formData.links || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
      };
      
      console.log('Project data to save:', projectData);
      
      // Insert project into database
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select();
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No project data returned after insert');
      }
      
      console.log('Project created successfully:', data[0].id);
      
      // Redirect to the project detail page
      router.push(`/projects/${data[0].id}`);
      
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error && typeof error === 'object' && 'message' in error)
          ? (error as any).message
          : String(error);
      alert('Failed to create project. Please try again. Error: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format duration label for display
  const formatDuration = (duration: string) => {
    switch (duration) {
      case 'short_term': return 'Short-term (Less than 1 month)';
      case 'medium_term': return 'Medium-term (1-3 months)';
      case 'long_term': return 'Long-term (3+ months)';
      default: return duration;
    }
  };
  
  return (
    <PageContainer title="Create New Project">
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Create a New Project</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Project Title<span className="text-red-500">*</span>
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
                placeholder="Give your project a clear, descriptive title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>
            
            {/* Project Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Project Description<span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleTextChange}
                rows={5}
                className={`w-full p-3 bg-gray-700 rounded-md border ${
                  errors.description ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Describe your project in detail. What are the goals? What problem does it solve? What's the scope and timeline?"
              ></textarea>
              <p className="mt-1 text-sm text-gray-400">
                {formData.description.length}/1000 characters
              </p>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>
            
            {/* Project Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Project Category<span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleSelectChange}
                className={`w-full p-3 bg-gray-700 rounded-md border ${
                  errors.category ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Select a category</option>
                {PROJECT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>
            
            {/* Skills Needed */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Skills Needed<span className="text-red-500">*</span>
              </label>
              <p className="text-gray-400 mb-3 text-sm">
                Select the skills you're looking for in collaborators
              </p>
              
              {errors.skillsNeeded && (
                <p className="mb-2 text-sm text-red-500">{errors.skillsNeeded}</p>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {SKILLS_NEEDED.map(skill => (
                  <div
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      formData.skillsNeeded.includes(skill)
                        ? 'bg-researchbee-yellow text-black'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {skill}
                  </div>
                ))}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Selected Skills ({formData.skillsNeeded.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.skillsNeeded.length === 0 ? (
                    <p className="text-gray-400">No skills selected</p>
                  ) : (
                    formData.skillsNeeded.map(skill => (
                      <div 
                        key={skill}
                        className="bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center"
                      >
                        {skill}
                        <button 
                          type="button"
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
            
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold mb-4">Collaboration Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Collaboration Type */}
                <div>
                  <label htmlFor="collaborationType" className="block text-sm font-medium mb-1">
                    Collaboration Type<span className="text-red-500">*</span>
                  </label>
                  <select
                    id="collaborationType"
                    name="collaborationType"
                    value={formData.collaborationType}
                    onChange={handleSelectChange}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600"
                  >
                    <option value="remote">Remote Only</option>
                    <option value="local">Local Only</option>
                    <option value="hybrid">Hybrid (Remote & Local)</option>
                  </select>
                </div>
                
                {/* Project Duration */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium mb-1">
                    Project Duration<span className="text-red-500">*</span>
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleSelectChange}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600"
                  >
                    <option value="short_term">{formatDuration('short_term')}</option>
                    <option value="medium_term">{formatDuration('medium_term')}</option>
                    <option value="long_term">{formatDuration('long_term')}</option>
                  </select>
                </div>
                
                {/* Time Commitment */}
                <div>
                  <label htmlFor="commitment" className="block text-sm font-medium mb-1">
                    Weekly Time Commitment (hours)<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="commitment"
                    name="commitment"
                    value={formData.commitment}
                    onChange={handleNumberChange}
                    min="1"
                    max="40"
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600"
                  />
                  <p className="mt-1 text-sm text-gray-400">
                    How many hours per week will this project require?
                  </p>
                </div>
                
                {/* Location (conditional) */}
                {(formData.collaborationType === 'local' || formData.collaborationType === 'hybrid') && (
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-1">
                      Location
                      {formData.collaborationType === 'local' && <span className="text-red-500">*</span>}
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
                    <p className="mt-1 text-sm text-gray-400">
                      Specify where local collaboration would take place
                    </p>
                  </div>
                )}
                
                {/* Deadline */}
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleTextChange}
                    className="w-full p-3 bg-gray-700 rounded-md border border-gray-600"
                  />
                </div>
              </div>
            </div>
            
            {/* Project Links */}
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold mb-4">Additional Resources</h2>
              
              <div>
                <label htmlFor="links" className="block text-sm font-medium mb-1">
                  Related Links
                </label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    id="links"
                    value={linkInput}
                    onChange={e => setLinkInput(e.target.value)}
                    className="flex-1 p-3 bg-gray-700 rounded-l-md border border-gray-600"
                    placeholder="Add GitHub, website, or other relevant links"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())}
                  />
                  <button
                    type="button"
                    onClick={addLink}
                    className="px-4 py-3 bg-gray-600 rounded-r-md hover:bg-gray-500"
                  >
                    Add
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formData.links && formData.links.length > 0 ? (
                    formData.links.map((link, index) => (
                      <div key={index} className="flex items-center">
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 text-researchbee-yellow hover:underline truncate"
                        >
                          {link}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="ml-2 text-gray-400 hover:text-white"
                        >
                          &times;
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No links added</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Project Visibility */}
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold mb-4">Project Visibility</h2>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 rounded border-gray-600 text-researchbee-yellow focus:ring-researchbee-yellow"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm">
                  Make this project public
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-400 pl-7">
                Public projects appear in search results and discovery feeds. Private projects are only visible to people you invite.
              </p>
            </div>
            
            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-researchbee-yellow text-black px-6 py-3 rounded-md hover:bg-yellow-500 font-medium flex justify-center items-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Project...
                  </span>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
} 