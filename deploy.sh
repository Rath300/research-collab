#!/bin/bash

# Deploy to Vercel

# 1. Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null
then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# 2. Copy environment files
echo "Setting up environment files..."
cp .env.production .env.local

# 3. Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

# 4. Set up project URL in Supabase
echo "==============================================="
echo "IMPORTANT: After deployment, make sure to update your Supabase project settings:"
echo "1. Go to https://app.supabase.com/project/yltnvmypasnfdgtnyhwg/auth/url-configuration"
echo "2. Set Site URL to: https://research-collab-nine.vercel.app"
echo "3. Add this Redirect URL: https://research-collab-nine.vercel.app/dashboard"
echo "4. Save changes"
echo "==============================================="
echo "Deployment complete!" 