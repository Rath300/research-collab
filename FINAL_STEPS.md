# Final Steps: Connecting Frontend to Backend for Production

## Overview
This document outlines the final steps needed to connect your frontend application to the Supabase backend in a production environment.

## 1. Environment Variables Setup

1. First, create a proper production environment file:
   ```bash
   cp apps/web/.env.example .env.production.local
   ```

2. Update all values in `.env.production.local` with your actual production credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NEXT_PUBLIC_API_URL=https://your-domain.com/api
   # Add all other required environment variables
   ```

3. Add these environment variables to your Vercel project settings:
   - Go to your Vercel dashboard
   - Select your project
   - Navigate to "Settings" > "Environment Variables"
   - Add all variables from your `.env.production.local` file

## 2. Update Supabase Configuration

1. In your Supabase dashboard, go to "Authentication" > "URL Configuration"
   
2. Add your production URL to the Site URL:
   ```
   https://your-domain.com
   ```

3. Add allowed redirect URLs:
   ```
   https://your-domain.com/auth/callback
   https://your-domain.com/login
   ```

4. In "Authentication" > "Email Templates", customize your email templates for:
   - Email confirmation
   - Magic link
   - Password recovery

5. Configure CORS in "API" > "Settings":
   - Add your production domain:
   ```
   https://your-domain.com
   ```

## 3. Deploy the Frontend

1. Run the deployment script:
   ```bash
   ./scripts/deploy.sh production
   ```

2. Once deployed, set up your custom domain in Vercel:
   - Go to your project in Vercel dashboard
   - Navigate to "Settings" > "Domains"
   - Add your domain and follow the DNS configuration instructions

## 4. Test Real-time Features

Real-time features are crucial to your application. Verify these are working:

1. **Chat System**:
   - Open two browser sessions (use incognito mode for one)
   - Log in with different users in each session
   - Start a chat between these users
   - Verify messages appear in real-time without refresh

2. **Notifications**:
   - Trigger a notification (e.g., by creating a match)
   - Verify it appears in real-time
   - Check that the unread count updates correctly

## 5. Verify Storage Configuration

1. Test avatar uploads in the Settings page:
   - Upload a profile image
   - Verify it displays correctly throughout the application
   - Check that the URL format is correct (should use your custom domain)

2. Verify that storage bucket policies are enforcing proper access controls:
   - Public access for avatars
   - Authenticated access for documents

## 6. Monitoring Setup

1. Set up Sentry for error tracking:
   - Add the Sentry SDK to your app
   - Configure it to capture errors and performance metrics

2. Create a custom error boundary component to handle React errors gracefully

3. Set up database monitoring with Supabase's monitoring tools

## 7. Performance Optimization

1. Implement caching for frequently accessed data:
   - Research posts feed
   - User profiles
   - Matches list

2. Enable CDN caching for static assets by configuring proper cache headers

3. Run Lighthouse audits and optimize based on results

## 8. Final Checklist Before Public Launch

1. Complete the full [Production Checklist](./PROD_CHECKLIST.md)

2. Perform a security review:
   - Test all authentication flows
   - Verify RLS policies
   - Check for exposed sensitive data

3. Create a maintenance page for future updates

4. Set up a regular backup schedule

5. Document rollback procedures in case of issues

## 9. Post-Launch

1. Monitor application performance and errors closely for the first 48 hours

2. Set up a user feedback system to collect reports of issues

3. Create a roadmap for future features and improvements

4. Establish a regular update schedule

---

Congratulations! Your ResearchCollab platform should now be fully connected and ready for production use. Remember to continuously monitor, maintain, and improve your application based on user feedback and performance metrics. 