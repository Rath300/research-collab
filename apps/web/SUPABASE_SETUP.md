# Supabase Setup Guide for ResearchCollab

This guide explains how to set up and use Supabase with ResearchCollab.

## Prerequisites

1. Create a [Supabase](https://supabase.io) account if you don't have one already
2. Create a new Supabase project
3. Node.js 18 or later installed

## Setting Up Supabase

### 1. Create Tables in Supabase

Navigate to the SQL Editor in your Supabase dashboard and run the following SQL to create the required tables:

```sql
-- Create tables for ResearchCollab
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  title TEXT,
  institution TEXT,
  location TEXT,
  email TEXT,
  website TEXT,
  availability TEXT CHECK (availability IN ('full-time', 'part-time', 'weekends', 'not-available')),
  field_of_study TEXT,
  interests TEXT[],
  education JSONB,
  joining_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  collaborators UUID[],
  tags TEXT[],
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'matched', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_id ON public.profiles(id);
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_matches_user_id_1 ON public.matches(user_id_1);
CREATE INDEX idx_matches_user_id_2 ON public.matches(user_id_2);
CREATE INDEX idx_messages_match_id ON public.messages(match_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Public projects are viewable by everyone" 
  ON public.projects FOR SELECT USING (true);

CREATE POLICY "Users can create their own projects" 
  ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects" 
  ON public.projects FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects" 
  ON public.projects FOR DELETE USING (auth.uid() = owner_id);

-- Matches policies
CREATE POLICY "Users can view their own matches" 
  ON public.matches FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can create matches they are part of" 
  ON public.matches FOR INSERT WITH CHECK (auth.uid() = user_id_1);

CREATE POLICY "Users can update matches they are part of" 
  ON public.matches FOR UPDATE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Messages policies
CREATE POLICY "Users can view messages in their matches" 
  ON public.messages FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id_1 FROM public.matches WHERE id = match_id
      UNION
      SELECT user_id_2 FROM public.matches WHERE id = match_id
    )
  );

CREATE POLICY "Users can send messages as themselves" 
  ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages they received as read" 
  ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);
```

### 2. Set up Authentication

1. Go to the Authentication section in your Supabase dashboard
2. Enable Email/Password sign-in method
3. Configure any additional auth providers you want (Google, GitHub, etc.)

### 3. Set up Storage

1. Go to the Storage section in your Supabase dashboard
2. Create a new bucket called `avatars` for profile pictures
3. Set the privacy to `public` if you want avatars to be publicly accessible

### 4. Get Project Credentials

From your Supabase project dashboard:

1. Click on the Settings icon in the sidebar
2. Go to API section
3. Copy your Project URL and anon/public key

## Local Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Install dependencies if you haven't already:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Using the Supabase Client

The project has a singleton Supabase client that you can use throughout the app:

```typescript
import { getSupabaseClient } from '../lib/supabaseClient';

// In your component or function
const doSomething = async () => {
  const supabase = getSupabaseClient();
  
  // Now use the client
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  // Handle the result
};
```

## Utility Functions

We've included several utility modules to simplify common operations:

### Authentication (`lib/auth.ts`)

- `getCurrentUser()`: Get the currently logged in user with profile data
- `signIn(email, password)`: Sign in with email and password
- `signUp(email, password, userData)`: Sign up a new user and create their profile
- `signOut()`: Sign out the current user

### Projects (`lib/projects.ts`)

- `getProjects(limit, offset, userId)`: Get projects with pagination
- `getProject(id)`: Get a single project by ID
- `createProject(project)`: Create a new project
- `updateProject(id, project)`: Update an existing project
- `deleteProject(id)`: Delete a project

### Matches (`lib/matches.ts`)

- `getPotentialMatches(userId, limit)`: Get potential matches for swiping
- `createMatch(userId, otherUserId, status)`: Create or update a match
- `getMatches(userId)`: Get all confirmed matches for a user

### Messaging (`lib/messaging.ts`)

- `getMessages(matchId, limit)`: Get messages for a match
- `sendMessage(message)`: Send a message
- `markMessagesAsRead(matchId, userId)`: Mark messages as read
- `setupMessageListener(matchId, callback)`: Set up real-time messages

## Type Definitions

We've included TypeScript type definitions for all Supabase tables in `types/database.types.ts`.

## Making Database Changes

If you need to modify the database schema:

1. Make changes in the Supabase dashboard or using SQL
2. Update the TypeScript definitions in `types/database.types.ts`
3. Update any affected utility functions

## Production Deployment

When deploying to production:

1. Set up environment variables in your hosting environment
2. Ensure Supabase permissions are properly configured
3. Update your Supabase project settings to allow requests from your production domain 