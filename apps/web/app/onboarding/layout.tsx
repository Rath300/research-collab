import React from 'react';

// Onboarding has a simpler layout, no main sidebar/header
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center">
      {children}
    </div>
  );
} 