import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Research-Bee - Academic Research Management Platform',
  description: 'Streamline your research workflow with Research-Bee. Organize projects, collaborate with peers, and manage your academic research efficiently.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
