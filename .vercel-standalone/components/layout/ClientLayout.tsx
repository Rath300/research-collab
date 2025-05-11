"use client";

import React from 'react';
import { Layout } from './Layout';
import { Providers } from '../providers/Providers';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Providers>
      <Layout>{children}</Layout>
    </Providers>
  );
} 