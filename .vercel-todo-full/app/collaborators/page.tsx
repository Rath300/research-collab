'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiFilter, FiRefreshCw, FiUsers } from 'react-icons/fi';
import { Button } from '../../components/Button';
import { FiUserPlus } from 'react-icons/fi';
import { PageContainer } from '../../components';

// Mocked profile data
interface Profile {
  id: string;
  name: string;
  title: string;
  institution: string;
  researchAreas: string[];
  bio: string;
  imageUrl?: string;
}

export default function CollaboratorsPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Mock profiles data
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  
  // Check if we're on the client side before trying to access browser APIs
  useEffect(() => {
    setIsClient(true);
    
    // Mock loading profiles
    setTimeout(() => {
      setProfiles([
        {
          id: '1',
          name: 'Dr. Sarah Chen',
          title: 'Associate Professor of Computer Science',
          institution: 'Stanford University',
          researchAreas: ['Machine Learning', 'Computer Vision', 'Natural Language Processing'],
          bio: 'Specializing in AI applications for healthcare. Looking for collaborators in medical imaging and clinical data analysis.'
        },
        {
          id: '2',
          name: 'Prof. Michael Rodriguez',
          title: 'Professor of Neuroscience',
          institution: 'UCLA',
          researchAreas: ['Neuroimaging', 'Cognitive Science', 'Brain-Computer Interfaces'],
          bio: 'Working on advanced BCI technologies. Seeking partnerships with AI and signal processing experts.'
        },
        {
          id: '3',
          name: 'Dr. Emily Johnson',
          title: 'Research Scientist',
          institution: 'MIT Media Lab',
          researchAreas: ['Human-Computer Interaction', 'Augmented Reality', 'Accessibility'],
          bio: 'Developing new interfaces for people with disabilities. Looking for collaborators in software engineering and UX research.'
        }
      ]);
      setIsLoading(false);
    }, 1500);
  }, []);

  // Function to handle navigation - only use on client side
  const navigateToLogin = () => {
    if (isClient) {
      router.push('/login');
    }
  };
  
  return (
    <PageContainer title="Find Collaborators">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-researchbee-light-gray mb-4">
              Connect with researchers who share your interests and expertise
            </p>
          </div>
          
          <Button 
            variant="secondary" 
            onPress={() => {}}
            leftIcon={<FiFilter />}
          >
            Filter Results
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-researchbee-yellow"></div>
          </div>
        ) : error ? (
          <div className="bg-researchbee-dark-gray rounded-lg p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onPress={() => setIsLoading(true)}>Retry</Button>
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-researchbee-dark-gray rounded-lg p-8 text-center">
            <FiUsers size={48} className="text-researchbee-light-gray mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No More Profiles</h3>
            <p className="text-researchbee-light-gray mb-6">You've seen all available researchers. Check back later or adjust your search criteria.</p>
            <Button onPress={() => setIsLoading(true)} leftIcon={<FiRefreshCw />}>
              Refresh Results
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(profile => (
              <div key={profile.id} className="bg-researchbee-dark-gray rounded-lg overflow-hidden hover:border-researchbee-yellow hover:border transition-all">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{profile.name}</h3>
                  <p className="text-researchbee-light-gray text-sm mb-3">{profile.title}</p>
                  <p className="text-white mb-2">{profile.institution}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Research Areas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.researchAreas.map(area => (
                        <span key={area} className="bg-researchbee-medium-gray px-2 py-1 rounded-full text-xs">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-researchbee-light-gray mb-4">{profile.bio}</p>
                  
                  <Button 
                    variant="outline"
                    leftIcon={<FiUserPlus />}
                    onPress={() => {}}
                    size="small"
                  >
                    Connect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
} 