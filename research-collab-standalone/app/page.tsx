'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if running on client-side
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Research Collab</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to login page...</p>
        <div className="mt-6 h-8 w-8 mx-auto animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
      </div>
    </div>
  );
}
