import React from 'react';

export default function HomePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
        Welcome to the Todo App
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '32px', color: '#6b7280' }}>
        A simple application to help you manage your tasks effectively
      </p>
      
      <a 
        href="/todo" 
        style={{ 
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '500',
          transition: 'background-color 0.2s'
        }}
      >
        Go to Todo App
      </a>
    </div>
  );
}
