'use client'; // Add 'use client' because we will use hooks

import type { Metadata } from 'next';
import './globals.css';
import dynamic from 'next/dynamic'; // Added for dynamic import
import { GeistSans } from 'geist/font/sans';
// import { Toaster } from '@/components/ui/toaster'; // Removed for now to avoid import error
// import { Sidebar } from '@/components/layout/Sidebar'; // Sidebar still commented out
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { useEffect } from 'react';

// Dynamically import AuthProvider with SSR turned off
const AuthProvider = dynamic(
  () => import('@/components/providers/auth-provider').then(mod => mod.AuthProvider),
  { ssr: false, loading: () => <div className="min-h-screen flex flex-1 justify-center items-center"><p>Loading authentication...</p></div> }
);

// export const metadata: Metadata = { // Metadata should be defined in a server component, cannot be in a 'use client' file.
// title: 'Research Collab',
// description: 'Collaborate on research projects, find partners, and share your work.',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, darkMode, setDarkMode } = useUIStore();

  const noSidebarPaths = ['/', '/login', '/signup'];
  const showSidebar = !noSidebarPaths.includes(pathname || '/');

  // Effect to set dark mode based on system preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);

    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    matcher.addEventListener('change', handleChange);
    return () => matcher.removeEventListener('change', handleChange);
  }, [setDarkMode]);

  // Optional: Close sidebar on mobile when navigating to a new page if it was forced open
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && sidebarOpen) {
      // setSidebarOpen(false); // Potentially too aggressive, depends on desired UX
    }
  }, [pathname, sidebarOpen, setSidebarOpen]);

  return (
    <html lang="en" className={`${GeistSans.variable} font-sans antialiased ${darkMode ? 'dark' : ''}`}>
      <body className="bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 min-h-screen flex flex-col">
        <AuthProvider>
          <div className="flex flex-1"> {/* Flex container for sidebar and main content */}
            {showSidebar && <div>Sidebar Placeholder</div>} {/* Replaced Sidebar component with a placeholder */}
            <main 
              className={`flex-grow transition-all duration-300 ease-in-out ${
                showSidebar 
                  // ? sidebarOpen ? 'ml-[270px]' : 'ml-[80px]' // Temporarily remove margin adjustments
                  ? 'ml-0' // Set to ml-0 for testing with placeholder
                  : 'ml-0'
              } w-full`}
            >
              {children}
            </main>
          </div>
          {/* <Toaster /> */}
        </AuthProvider>
      </body>
    </html>
  );
}
