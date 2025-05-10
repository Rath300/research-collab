# Research Collab Application

A platform for researchers to connect, collaborate, and share their research.

## Deployment

The application is currently deployed at:
https://research-collab-l9aowzxsm-shreyanshrath4-gmailcoms-projects.vercel.app

## Authentication Options

The application supports multiple authentication methods:

### Email/Password Login
Users can sign in using their email and password credentials. This is the most traditional authentication method.

### OAuth Providers
The application supports authentication with:
- Google
- GitHub

### Guest Login
The application features a streamlined guest login that requires no credentials. This allows users to explore the platform without creating an account. Guest users have access to a limited dashboard and can browse research posts.

## Redirect Handling

All authentication methods properly handle the `redirectTo` query parameter. If you access the login page with a `redirectTo` parameter (e.g., `/login?redirectTo=/research`), you'll be redirected to the specified page after successful login.

## Setup Supabase Authentication

To ensure authentication works properly, you need to configure the Supabase project with the correct redirect URLs:

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Authentication → URL Configuration
4. Set the Site URL to match your production deployment URL:
   ```
   https://research-collab-l9aowzxsm-shreyanshrath4-gmailcoms-projects.vercel.app
   ```
5. Add the following Additional Redirect URLs:
   ```
   http://localhost:3000/**
   https://research-collab-l9aowzxsm-shreyanshrath4-gmailcoms-projects.vercel.app/**
   ```
   
The `**` wildcard ensures that redirects work for all paths in your application.

## Features

- Research post creation and sharing
- Collaboration matching with other researchers
- User profiles with research interests and institution information
- Public and private visibility options for research content
- Boosting of research posts for increased visibility
- Engagement tracking and analytics
- Dashboard with statistics and recent activity
- Real-time chat with matched collaborators
- Notification system

## Tech Stack

- Next.js for the frontend and API routes
- Supabase for authentication and database
- React with hooks and context (Zustand) for state management
- Tailwind CSS for styling
- Real-time subscriptions for chat and notifications

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
