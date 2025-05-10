import React from 'react';
import Head from 'next/head';

interface PageContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function PageContainer({ title, description, children }: PageContainerProps) {
  const pageTitle = `${title} | ItsMightHappen`;
  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <main className="min-h-screen bg-researchbee-black text-white p-4 md:p-6">
        {children}
      </main>
    </>
  );
} 