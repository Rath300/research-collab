#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Deploying web app to Vercel..."

# Change directory to the web app
cd apps/web

# Create a temporary package.json for the web app
echo "Creating temporary package.json for deployment..."
node -e "
const pkg = require('./package.json');
const fs = require('fs');

// Add build script if it doesn't exist
if (!pkg.scripts.build) {
  pkg.scripts.build = 'next build';
}

// Add start script if it doesn't exist
if (!pkg.scripts.start) {
  pkg.scripts.start = 'next start';
}

// Remove workspace-specific configurations
delete pkg.workspaces;

// Write the updated package.json
fs.writeFileSync('./package.json.deploy', JSON.stringify(pkg, null, 2));
"

# Rename the original package.json
mv package.json package.json.orig
mv package.json.deploy package.json

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
npx vercel deploy --prod

# Restore original package.json
echo "Cleaning up..."
mv package.json.orig package.json
rm -f vercel.json

echo "Deployment complete!" 