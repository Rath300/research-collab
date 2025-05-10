import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Todo App</h1>
        <p className="text-xl mb-8 text-gray-600">A simple application to help you manage your tasks effectively</p>
        
        <div className="space-y-4">
          <Link 
            href="/todo" 
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Todo App
          </Link>
        </div>
      </div>
    </div>
  );
}
