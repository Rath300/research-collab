"use client";

import React, { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import type { Session } from '@supabase/supabase-js';

interface ProvidersProps {
  children: ReactNode;
  session: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
    </ThemeProvider>
  );
} 