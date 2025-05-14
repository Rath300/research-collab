import React from 'react';
import Head from 'next/head';

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string; 
}

export function PageContainer({ title, children, className }: PageContainerProps) {
  return (
    <>
      <Head>
        <title>{`${title} | ResearchCollab`}</title>
      </Head>
      <main className={`px-4 sm:px-6 lg:px-8 py-8 ${className || ''}`}>
        {children}
      </main>
    </>
  );
} 