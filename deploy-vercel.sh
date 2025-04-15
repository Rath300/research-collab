#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Deploying the ResearchCollab app to Vercel..."

# 1. Install global dependencies
echo "Installing global dependencies..."
npm install -g vercel

# 2. Update environment variables
echo "Setting up environment variables for production..."
cp .env.production .env.local

# 3. Create a temporary deployment directory
echo "Creating temporary deployment directory..."
mkdir -p .vercel-deploy
cd .vercel-deploy

# 4. Copy the required files from the main project
echo "Copying necessary files..."
cp -r ../apps/web ./apps/
cp -r ../packages ./packages/
cp ../package.json ./
cp ../vercel.json ./
cp ../package-lock.json ./
cp ../tsconfig.json ./
cp ../turbo.json ./

# 5. Update the vercel.json file
echo "Updating vercel.json configuration..."
cat > vercel.json << EOF
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs"
}
EOF

# 6. Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

# 7. Clean up
echo "Cleaning up..."
cd ..
rm -rf .vercel-deploy

echo "Deployment complete!" 