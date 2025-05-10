import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to Todo App</h1>
        
        <p className="text-gray-600 mb-8 text-center">
          A simple todo application built with Next.js, React, and Zustand.
        </p>
        
        <div className="flex justify-center">
          <Link 
            href="/todo" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Go to Todo App
          </Link>
        </div>
      </div>
    </div>
  );
} 