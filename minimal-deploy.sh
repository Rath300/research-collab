#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Preparing minimal deployment for Vercel..."

# Create a temporary deployment directory
echo "Creating temporary deployment directory..."
rm -rf .vercel-minimal
mkdir -p .vercel-minimal
cd .vercel-minimal

# Create the most basic structure
mkdir -p app
mkdir -p public

# Create a minimal page
echo "Creating minimal page..."
cat > app/page.tsx << EOF
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
EOF

# Create layout.tsx
cat > app/layout.tsx << EOF
export const metadata = {
  title: 'ResearchCollab - Deployment Test',
  description: 'Testing deployment for the ResearchCollab platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF

# Create a simple package.json with Next.js 13
echo "Creating package.json..."
cat > package.json << EOF
{
  "name": "research-collab-minimal",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "13.5.6",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@types/node": "20.10.6",
    "@types/react": "18.2.46",
    "@types/react-dom": "18.2.18",
    "typescript": "5.3.3"
  }
}
EOF

# Create a basic tsconfig.json
echo "Creating tsconfig.json..."
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create next.config.js
echo "Creating next.config.js..."
cat > next.config.js << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
EOF

# Create next-env.d.ts
echo "Creating next-env.d.ts..."
cat > next-env.d.ts << EOF
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
EOF

# Create .env file
echo "Creating environment variables..."
cat > .env.production << EOF
# App Configuration
NEXT_PUBLIC_APP_URL=https://research-collab.vercel.app
NODE_ENV=production
EOF

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel deploy --prod --yes

# Clean up
echo "Cleaning up..."
cd ..
# rm -rf .vercel-minimal

echo "Minimal deployment process complete!" 