import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research Collaboration',
  description: 'Platform for research collaboration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
