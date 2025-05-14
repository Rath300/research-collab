import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { GeistSans } from 'geist/font/sans';
// import { Toaster } from '@/components/ui/toaster'; // Removed for now to avoid import error

export const metadata: Metadata = {
  title: 'Research Collab',
  description: 'Collaborate on research projects, find partners, and share your work.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} font-sans antialiased`}>
      <body className="bg-black text-neutral-100 min-h-screen flex flex-col">
        <AuthProvider>
          {/* ThemeProvider can be added back here if needed */}
          <main className="flex-grow">{children}</main>
          {/* <Toaster /> */}
        </AuthProvider>
      </body>
    </html>
  );
}
