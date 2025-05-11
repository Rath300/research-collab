# ResearchCollab Deployment Guide

## Deployment URL
The application is deployed at: https://research-collab-nine.vercel.app/

## Connected Supabase Account
- Email: shreyanshrath4@gmail.com
- Project URL: https://yltnvmypasnfdgtnyhwg.supabase.co

## Environment Variables
Ensure the following environment variables are set in Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SUPABASE_REDIRECT_URL
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_API_URL
- NODE_ENV

## Deployment Steps
1. Push your code to GitHub
2. Connect your Vercel account to the GitHub repository
3. Configure the environment variables in Vercel
4. Deploy using the Vercel dashboard

## Troubleshooting
If you encounter deployment errors:
- Check the dependency versions in package.json
- Ensure TypeScript types are compatible
- Verify that all environment variables are set correctly
