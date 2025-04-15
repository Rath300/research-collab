export default function Home() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      maxWidth: '600px', 
      margin: '0 auto' 
    }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#334155' }}>
        ResearchCollab Deployment Test
      </h1>
      <p style={{ marginBottom: '20px', color: '#64748b' }}>
        This is a test deployment page to verify the Vercel deployment works correctly.
      </p>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f1f5f9', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p><strong>Environment check:</strong></p>
        <p>NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</p>
        <p>NODE_ENV: {process.env.NODE_ENV || 'Not set'}</p>
      </div>
      <a 
        href="/test"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}
      >
        Test Page
      </a>
    </div>
  );
}
