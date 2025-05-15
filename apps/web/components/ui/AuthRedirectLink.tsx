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
  // const { user } = useAuthStore(); // No longer need to check client-side auth state here
  // const router = useRouter(); // No longer needed for immediate client-side redirect

  // const handleRedirect = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  //   e.preventDefault(); 
  //   router.push('/dashboard');
  // };

  // if (user) {
  //   return (
  //     <a 
  //       href="/dashboard" 
  //       onClick={handleRedirect}
  //       className={className}
  //       {...props}
  //     >
  //       {children}
  //     </a>
  //   );
  // }

  // Always render the original Link. Middleware will handle redirection if necessary.
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
} 