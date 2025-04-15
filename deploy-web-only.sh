#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Preparing Web-only deployment for Vercel..."

# Create a temporary deployment directory
echo "Creating temporary deployment directory..."
rm -rf .vercel-web-only
mkdir -p .vercel-web-only
cd .vercel-web-only

# Copy the web app files
echo "Copying web app files..."
cp -r ../apps/web/app ./app
cp -r ../apps/web/components ./components
cp -r ../apps/web/lib ./lib
cp -r ../apps/web/public ./public
cp -r ../apps/web/types ./types

# Copy necessary configuration files
echo "Copying configuration files..."
cp ../apps/web/next.config.js ./next.config.js
cp ../apps/web/tsconfig.json ./tsconfig.json
cp ../apps/web/next-env.d.ts ./next-env.d.ts
cp ../apps/web/middleware.ts ./middleware.ts

# Fix PostCSS configuration
echo "Creating PostCSS configuration..."
cat > postcss.config.js << EOF
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create tailwind configuration
echo "Creating Tailwind configuration..."
cat > tailwind.config.js << EOF
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
    },
  },
  plugins: [],
}
EOF

# Create a simplified package.json
echo "Creating package.json..."
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
    "next": "^13.5.6",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-icons": "^5.0.1",
    "zustand": "^4.5.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.3.3",
    "eslint": "^9.0.0",
    "eslint-config-next": "^13.5.6"
  }
}
EOF

# Fix login page
echo "Fixing login page TypeScript error..."
# Check if the login page exists and fix it
if [ -f "app/login/page.tsx" ]; then
  sed -i '' 's/setProfile(userProfile);/setProfile(userProfile as any);/g' app/login/page.tsx
fi

# Copy .env files
echo "Copying environment variables..."
cp ../apps/web/.env.production ./.env.production
cp ../apps/web/.env.local ./.env.local 2>/dev/null || true

# Create a simple vercel.json
echo "Creating Vercel configuration..."
cat > vercel.json << EOF
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
EOF

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel deploy --prod --yes

# Clean up
echo "Cleaning up..."
cd ..
# Uncomment to clean up
# rm -rf .vercel-web-only

echo "Web-only deployment process complete!" 