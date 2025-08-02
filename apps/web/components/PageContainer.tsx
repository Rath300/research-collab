import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
}

export function PageContainer({ children, title }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="container mx-auto px-4 py-8">
        {title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}
        {children}
      </div>
    </div>
  );
} 