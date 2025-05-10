import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
