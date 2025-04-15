#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Preparing simplified deployment for Vercel..."

# Create a temporary deployment directory
echo "Creating temporary deployment directory..."
rm -rf .vercel-standalone
mkdir -p .vercel-standalone
cd .vercel-standalone

# Copy only the essential web app files
echo "Copying web app files..."
cp -r ../apps/web/app ./app
cp -r ../apps/web/components ./components
cp -r ../apps/web/lib ./lib
cp -r ../apps/web/public ./public
cp -r ../apps/web/types ./types
cp ../apps/web/postcss.config.js ./postcss.config.js
cp ../apps/web/tailwind.config.js ./tailwind.config.js
cp ../apps/web/middleware.ts ./middleware.ts
cp ../apps/web/next-env.d.ts ./next-env.d.ts
mkdir -p .next
cp -r ../apps/web/.next/types ./.next/types 2>/dev/null || true

# Create a simplified package.json
echo "Creating simplified package.json..."
cat > package.json << EOF
{
  "name": "research-collab-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "^0.9.0",
    "@supabase/auth-helpers-react": "^0.4.2",
    "@supabase/ssr": "^0.1.0",
    "@supabase/supabase-js": "^2.39.6",
    "next": "^15.3.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-icons": "^5.0.1",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.8.2",
    "zod": "^3.22.4",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "@types/react": "^18.2.67",
    "@types/react-dom": "^18.2.22",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.4.3",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.3.0"
  }
}
EOF

# Create a simple Next.js config
echo "Creating next.config.js..."
cat > next.config.js << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
EOF

# Create a simple tsconfig.json
echo "Creating tsconfig.json..."
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# Create a minimal Vercel config
echo "Creating vercel.json..."
cat > vercel.json << EOF
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
EOF

# Create minimal eslint config
echo "Creating eslint.config.js..."
cat > eslint.config.js << EOF
module.exports = {
  extends: ['next/core-web-vitals']
};
EOF

# Create simplified standalone page
echo "Creating a simplified standalone page..."
mkdir -p app
cat > app/page.tsx << EOF
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
EOF

# Copy environment variables
echo "Copying environment variables..."
cp ../apps/web/.env.production ./.env.production
cp ../apps/web/.env.local ./.env.local 2>/dev/null || true

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel deploy --prod --yes

# Clean up
echo "Cleaning up..."
cd ..
# rm -rf .vercel-standalone

echo "Deployment process complete!" 