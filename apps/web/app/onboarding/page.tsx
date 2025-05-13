'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

// Placeholder components for onboarding steps
const ProfileStep = ({ onNext }: { onNext: () => void }) => (
  <div className="text-center">
    <h2 className="text-2xl font-semibold text-neutral-100 mb-4">Set Up Your Profile</h2>
    <p className="text-neutral-400 mb-6">Let's get your basic information set up.</p>
    {/* Add profile form fields here */}
    <div className="bg-neutral-800 p-6 rounded-lg mb-6">
      <p className="text-neutral-300">Profile form fields will go here...</p>
      <p className="text-sm text-neutral-500">(Name, Avatar, Bio, etc.)</p>
    </div>
    <Button onClick={onNext} variant="primary" size="lg">Next: Research Interests</Button>
  </div>
);

const InterestsStep = ({ onNext }: { onNext: () => void }) => (
  <div className="text-center">
    <h2 className="text-2xl font-semibold text-neutral-100 mb-4">Research Interests</h2>
    <p className="text-neutral-400 mb-6">Help us connect you with relevant projects and people.</p>
    {/* Add interests selection here */}
    <div className="bg-neutral-800 p-6 rounded-lg mb-6">
      <p className="text-neutral-300">Interests selection will go here...</p>
      <p className="text-sm text-neutral-500">(Keywords, fields of study, etc.)</p>
    </div>
    <Button onClick={onNext} variant="primary" size="lg">Next: Start a Project</Button>
  </div>
);

const StartProjectStep = ({ onFinish }: { onFinish: () => void }) => (
  <div className="text-center">
    <h2 className="text-2xl font-semibold text-neutral-100 mb-4">Ready to Collaborate?</h2>
    <p className="text-neutral-400 mb-6">You can start a new project now or explore later.</p>
    <div className="bg-neutral-800 p-6 rounded-lg mb-6">
      <p className="text-neutral-300">Information about starting a project...</p>
    </div>
    <div className="flex justify-center space-x-4">
        <Button onClick={() => alert('Navigate to new project page')} variant="secondary" size="lg">Start a New Project</Button>
        <Button onClick={onFinish} variant="primary" size="lg">Finish Onboarding</Button>
    </div>
  </div>
);

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const nextStep = () => setStep(s => s + 1);
  const finishOnboarding = () => {
    // Here you would typically mark onboarding as complete for the user
    // e.g., via an API call to update user profile
    console.log('Onboarding finished!');
    router.push('/dashboard'); // Redirect to dashboard
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Add cool animations and transitions between steps later */}
        {step === 1 && <ProfileStep onNext={nextStep} />}
        {step === 2 && <InterestsStep onNext={nextStep} />}
        {step === 3 && <StartProjectStep onFinish={finishOnboarding} />}

        {/* Progress Indicator (optional) */}
        <div className="mt-8 flex justify-center space-x-2">
          {[1, 2, 3].map(s => (
            <div 
              key={s} 
              className={`w-3 h-3 rounded-full ${step >= s ? 'bg-pink-500' : 'bg-neutral-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 