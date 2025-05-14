'use client'; // Add 'use client' because we will use hooks

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { GeistSans } from 'geist/font/sans';
// import { Toaster } from '@/components/ui/toaster'; // Removed for now to avoid import error
import { Sidebar } from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { useEffect } from 'react';

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
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const noSidebarPaths = ['/', '/login', '/signup'];
  const showSidebar = !noSidebarPaths.includes(pathname || '/');

  // Optional: Close sidebar on mobile when navigating to a new page if it was forced open
  useEffect(() => {
    if (window.innerWidth < 768 && sidebarOpen) {
      // setSidebarOpen(false); // Potentially too aggressive, depends on desired UX
    }
  }, [pathname, sidebarOpen, setSidebarOpen]);

  return (
    <html lang="en" className={`${GeistSans.variable} font-sans antialiased`}>
      <body className="bg-black text-neutral-100 min-h-screen flex flex-col">
        <AuthProvider>
          <div className="flex flex-1"> {/* Flex container for sidebar and main content */}
            {showSidebar && <Sidebar />}
            <main 
              className={`flex-grow transition-all duration-300 ease-in-out ${
                showSidebar 
                  ? sidebarOpen ? 'ml-[270px]' : 'ml-[80px]' 
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
