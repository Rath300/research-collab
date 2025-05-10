-- Enable needed extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  availability TEXT CHECK (availability IN ('full-time', 'part-time', 'weekends', 'not-available')),
  interests TEXT[] DEFAULT '{}',
  project_history TEXT[] DEFAULT '{}',
  is_mentor BOOLEAN DEFAULT FALSE,
  field_of_study TEXT,
  email TEXT NOT NULL UNIQUE,
  institution TEXT
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create index for profile search
CREATE INDEX IF NOT EXISTS profiles_full_name_idx ON profiles
  USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_interests_idx ON profiles USING GIN (interests);

-- Research posts table
CREATE TABLE IF NOT EXISTS research_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'connections')),
  is_boosted BOOLEAN DEFAULT FALSE,
  boost_end_date TIMESTAMPTZ,
  engagement_count INTEGER DEFAULT 0
);

-- Enable RLS on research_posts
ALTER TABLE research_posts ENABLE ROW LEVEL SECURITY;

-- Policies for research_posts
CREATE POLICY "Public posts are viewable by everyone"
  ON research_posts FOR SELECT
  USING (visibility = 'public' OR user_id = auth.uid() OR 
         (visibility = 'connections' AND EXISTS (
           SELECT 1 FROM collaborator_matches
           WHERE (user_id = auth.uid() AND matched_user_id = research_posts.user_id) OR
                 (matched_user_id = auth.uid() AND user_id = research_posts.user_id)
           AND status = 'matched'
         )));

CREATE POLICY "Users can insert their own posts"
  ON research_posts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own posts"
  ON research_posts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts"
  ON research_posts FOR DELETE
  USING (user_id = auth.uid());

-- Create indexes for research posts
CREATE INDEX IF NOT EXISTS research_posts_user_id_idx ON research_posts(user_id);
CREATE INDEX IF NOT EXISTS research_posts_tags_idx ON research_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS research_posts_title_idx ON research_posts USING GIN(title gin_trgm_ops);

-- Collaborator matches table
CREATE TABLE IF NOT EXISTS collaborator_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'rejected')),
  UNIQUE(user_id, matched_user_id)
);

-- Enable RLS on collaborator_matches
ALTER TABLE collaborator_matches ENABLE ROW LEVEL SECURITY;

-- Policies for collaborator_matches
CREATE POLICY "Users can view their own matches"
  ON collaborator_matches FOR SELECT
  USING (user_id = auth.uid() OR matched_user_id = auth.uid());

CREATE POLICY "Users can insert matches"
  ON collaborator_matches FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own matches"
  ON collaborator_matches FOR UPDATE
  USING (user_id = auth.uid() OR matched_user_id = auth.uid());

-- Guilds table
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logo_url TEXT,
  activity_score INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 1
);

-- Enable RLS on guilds
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

-- Policies for guilds
CREATE POLICY "Guilds are viewable by everyone"
  ON guilds FOR SELECT
  USING (true);

CREATE POLICY "Creator can insert guilds"
  ON guilds FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creator can update guild"
  ON guilds FOR UPDATE
  USING (creator_id = auth.uid());

-- Create indexes for guilds
CREATE INDEX IF NOT EXISTS guilds_creator_id_idx ON guilds(creator_id);
CREATE INDEX IF NOT EXISTS guilds_name_idx ON guilds USING GIN(name gin_trgm_ops);

-- Guild members table (join table)
CREATE TABLE IF NOT EXISTS guild_members (
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  PRIMARY KEY (guild_id, user_id)
);

-- Enable RLS on guild_members
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;

-- Policies for guild_members
CREATE POLICY "Guild members are viewable by everyone"
  ON guild_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join guilds"
  ON guild_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave guilds"
  ON guild_members FOR DELETE
  USING (user_id = auth.uid());

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  leader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guild_id UUID REFERENCES guilds(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
  tags TEXT[] DEFAULT '{}'
);

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Projects are viewable by everyone"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Leader can insert project"
  ON projects FOR INSERT
  WITH CHECK (leader_id = auth.uid());

CREATE POLICY "Leader can update project"
  ON projects FOR UPDATE
  USING (leader_id = auth.uid());

CREATE POLICY "Leader can delete project"
  ON projects FOR DELETE
  USING (leader_id = auth.uid());

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS projects_leader_id_idx ON projects(leader_id);
CREATE INDEX IF NOT EXISTS projects_guild_id_idx ON projects(guild_id);
CREATE INDEX IF NOT EXISTS projects_tags_idx ON projects USING GIN(tags);

-- Project members table (join table)
CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  PRIMARY KEY (project_id, user_id)
);

-- Enable RLS on project_members
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Policies for project_members
CREATE POLICY "Project members are viewable by everyone"
  ON project_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join projects"
  ON project_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave projects"
  ON project_members FOR DELETE
  USING (user_id = auth.uid());

-- Mentor applications table
CREATE TABLE IF NOT EXISTS mentor_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_idea TEXT NOT NULL,
  field TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'rejected')),
  matched_mentor_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable RLS on mentor_applications
ALTER TABLE mentor_applications ENABLE ROW LEVEL SECURITY;

-- Policies for mentor_applications
CREATE POLICY "Users can view their own applications"
  ON mentor_applications FOR SELECT
  USING (user_id = auth.uid() OR matched_mentor_id = auth.uid());

CREATE POLICY "Mentors can view pending applications"
  ON mentor_applications FOR SELECT
  USING (status = 'pending' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_mentor = true
  ));

CREATE POLICY "Users can insert applications"
  ON mentor_applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own applications"
  ON mentor_applications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Mentors can update matched applications"
  ON mentor_applications FOR UPDATE
  USING (matched_mentor_id = auth.uid());

-- Proof submissions table
CREATE TABLE IF NOT EXISTS proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blockchain_tx TEXT
);

-- Enable RLS on proofs
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;

-- Policies for proofs
CREATE POLICY "Proofs are viewable by everyone"
  ON proofs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert proofs for their projects"
  ON proofs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own proofs"
  ON proofs FOR UPDATE
  USING (user_id = auth.uid());

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES collaborator_matches(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can insert messages to matched users"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM collaborator_matches
    WHERE id = match_id
    AND ((user_id = auth.uid() AND matched_user_id = receiver_id) OR
         (matched_user_id = auth.uid() AND user_id = receiver_id))
    AND status = 'matched'
  ));

CREATE POLICY "Users can update read status of received messages"
  ON messages FOR UPDATE
  USING (receiver_id = auth.uid());

-- Create index for messages
CREATE INDEX IF NOT EXISTS messages_match_id_idx ON messages(match_id);
CREATE INDEX IF NOT EXISTS messages_sender_receiver_idx ON messages(sender_id, receiver_id);

-- AI Reviews table
CREATE TABLE IF NOT EXISTS ai_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  review_content TEXT NOT NULL,
  suggested_edits TEXT,
  suggested_citations TEXT[],
  quality_score INTEGER
);

-- Enable RLS on ai_reviews
ALTER TABLE ai_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for ai_reviews
CREATE POLICY "Users can view their own AI reviews"
  ON ai_reviews FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert AI reviews"
  ON ai_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  status TEXT DEFAULT 'trialing' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),
  current_period_end TIMESTAMPTZ NOT NULL
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Function to update user's points when they make a submission
CREATE OR REPLACE FUNCTION update_user_activity_points()
RETURNS TRIGGER AS $$
BEGIN
  -- If a project belongs to a guild, update the guild's activity score
  IF NEW.guild_id IS NOT NULL THEN
    UPDATE guilds
    SET activity_score = activity_score + 10
    WHERE id = NEW.guild_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update points when a new proof is submitted
CREATE TRIGGER update_points_on_proof
  AFTER INSERT ON proofs
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity_points();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all tables with updated_at column
CREATE TRIGGER update_profiles_modified
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_research_posts_modified
  BEFORE UPDATE ON research_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_projects_modified
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Function to update guild member count
CREATE OR REPLACE FUNCTION update_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE guilds
    SET member_count = member_count + 1
    WHERE id = NEW.guild_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE guilds
    SET member_count = member_count - 1
    WHERE id = OLD.guild_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update guild member count
CREATE TRIGGER update_guild_member_count
  AFTER INSERT OR DELETE ON guild_members
  FOR EACH ROW
  EXECUTE FUNCTION update_guild_member_count();

-- Create or update supabase_auth.users trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, 
          COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'), 
          COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'match', 'system', 'mention')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Set up RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id); 