import React from 'react';

export const metadata = {
  title: 'Todo App',
  description: 'A simple todo application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        backgroundColor: '#f5f5f5'
      }}>
        <main style={{ minHeight: '100vh', padding: '24px 0' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
