# Research Collaboration Platform

A modern collaboration platform for researchers to share ideas, find collaborators, join project guilds, and verify ownership of research contributions.

## Tech Stack

- **Frontend**: React (Next.js for web, Expo for mobile)
- **UI Framework**: Tamagui for cross-platform UI
- **Backend**: Supabase Presets v2+ (Auth, Database, Storage, Realtime, Edge Functions)
- **State Management**: Zustand for client state, TanStack Query for server state
- **Monorepo Management**: Turborepo
- **Type Safety**: TypeScript and Zod for validation
- **Navigation**: Solito for cross-platform navigation
- **Payments**: Stripe for subscriptions

## Project Structure

```
research-collab/
├── apps/
│   ├── docs/          # Documentation site
│   └── web/           # Next.js web app
├── packages/
│   ├── api/           # Shared API hooks
│   ├── db/            # Database client and schema
│   ├── eslint-config/ # Shared ESLint configuration
│   ├── typescript-config/ # Shared TypeScript configuration
│   └── ui/            # Shared UI components
```

## Features

- **User Profile System**: LinkedIn-like profiles with interests, project history, and more
- **Research Feed**: Infinite scroll feed of research ideas and posts
- **Collaborator Matching**: Tinder-style swipe UI to find research partners
- **Project Guilds**: Team-based research groups with leaderboards
- **Timestamping & Proof of Ownership**: Verify research contributions with timestamps
- **Mentor Matching**: Connect students with expert mentors
- **AI Paper Review**: Get AI-powered feedback on research papers
- **Project Collaboration**: Shared spaces for team coordination
- **Premium Subscriptions**: Freemium model with paid tiers for advanced features

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/research-collab.git
   cd research-collab
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create `.env.local` files in both `apps/web` and `apps/expo` directories with the following variables:
   ```
   # For web (Next.js)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # For mobile (Expo)
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   # Run all apps and packages
   npm run dev
   
   # Run only the web app
   npm run dev --filter=web
   ```

### Setting up Supabase

1. Create a new Supabase project in the [Supabase Dashboard](https://app.supabase.io/)

2. Apply the database schema:
   - Go to the SQL Editor in your Supabase project
   - Copy the SQL from `packages/db/schema.sql` and run it
   - Or use the Supabase Migration functionality to apply it

3. Configure Authentication:
   - Enable Email/Password and Social providers in the Auth settings
   - Set up redirect URLs for your production and development environments

### Setting up Stripe (for payments)

1. Create a Stripe account and get your API keys

2. Set up products and pricing in the Stripe dashboard

3. Update your environment variables with Stripe keys:
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. Set up Stripe webhooks to communicate with your backend

## Deployment

### Frontend (Next.js)

1. Deploy to Vercel:
   ```bash
   npx vercel
   ```

### Backend (Supabase)

1. Make sure your schema is applied to your production Supabase project

2. Update environment variables in production with the correct Supabase URLs and keys

3. Set up Supabase Edge Functions if needed for custom server logic

## License

[MIT](LICENSE)
