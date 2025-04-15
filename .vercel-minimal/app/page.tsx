export default function Home() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      maxWidth: '600px', 
      margin: '0 auto' 
    }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>
        ResearchCollab Deployment Test
      </h1>
      <p style={{ marginBottom: '20px' }}>
        This is a test deployment page for ResearchCollab platform.
      </p>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f1f5f9', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p><strong>Environment Information:</strong></p>
        <p>NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</p>
        <p>NODE_ENV: {process.env.NODE_ENV || 'Not set'}</p>
      </div>
      <a 
        href="https://github.com/Rath300/research-collab"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}
      >
        View on GitHub
      </a>
    </div>
  );
}
