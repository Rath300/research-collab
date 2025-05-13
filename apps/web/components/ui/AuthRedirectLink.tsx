'use client';

import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import React from 'react';

interface AuthRedirectLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  // Add any other props you expect the Link or a button might take
  [key: string]: any; 
}

export function AuthRedirectLink({ 
  href, 
  children, 
  className, 
  ...props 
}: AuthRedirectLinkProps) {
  const { user } = useAuthStore();
  const router = useRouter();

  const handleRedirect = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault(); // Prevent default Link behavior if we're redirecting
    router.push('/dashboard');
  };

  if (user) {
    // If user is logged in, this link/button should go to the dashboard
    // We render an anchor tag styled like the original link/button
    // but its click action is to go to /dashboard
    return (
      <a 
        href="/dashboard" // Visually shows dashboard but JS handles click
        onClick={handleRedirect}
        className={className}
        {...props} // Pass through other props like style, id, etc.
      >
        {children}
      </a>
    );
  }

  // If no user, render the original Link as intended
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
} 