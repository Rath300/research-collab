import type { Metadata } from 'next';
import './globals.css';
import '@fontsource/inter/variable.css';
import { GeistSans } from 'geist/font/sans';
import { AuthProvider } from '@/components/providers/auth-provider';

export const metadata: Metadata = {
  title: "Research Bee - Research Collaboration Platform",
  description: "Connect with fellow researchers, find collaborators for your projects, join research guilds, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="font-sans bg-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
