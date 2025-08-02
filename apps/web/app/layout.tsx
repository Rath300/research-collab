import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { TRPCProvider } from '@/components/providers/TRPCProvider';
import { Inter, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';

// Primary font - Inter (clean, modern)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Monospace font - JetBrains Mono (for code)
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

// Display font - Using Inter as fallback for now (Cal Sans can be added later)
const calSans = {
  variable: '--font-cal-sans',
};

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
    <html 
      lang="en" 
      className={`${inter.variable} ${jetbrainsMono.variable} ${calSans.variable} font-sans antialiased`}
    >
      <body className="bg-bg-primary text-text-primary min-h-screen flex flex-col font-body antialiased transition-colors">
        <AuthProvider>
          <TRPCProvider>
            {/* ThemeProvider can be added back here if needed */}
            <main className="flex-grow">{children}</main>
            {/* <Toaster /> */}
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
