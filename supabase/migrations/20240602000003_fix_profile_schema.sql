-- First, rename the id column to user_id for existing profiles
ALTER TABLE public.profiles 
RENAME COLUMN id TO user_id;

-- Drop the foreign key constraint if it exists
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add the foreign key constraint back with the new column name
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id);

-- Add id column as UUID if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- Make sure we have all the columns the code expects
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS looking_for TEXT[],
ADD COLUMN IF NOT EXISTS project_preference TEXT CHECK (project_preference IN ('remote', 'local', 'hybrid')),
ADD COLUMN IF NOT EXISTS visibility TEXT CHECK (visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS availability_hours INTEGER CHECK (availability_hours >= 0 AND availability_hours <= 40),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing profiles with default values
UPDATE public.profiles 
SET 
  full_name = COALESCE(full_name, CONCAT(first_name, ' ', last_name)),
  title = COALESCE(title, 'Researcher'),
  skills = COALESCE(skills, '{}'),
  interests = COALESCE(interests, '{}'),
  looking_for = COALESCE(looking_for, '{}'),
  project_preference = COALESCE(project_preference, 'remote'),
  visibility = COALESCE(visibility, 'public'),
  availability_hours = COALESCE(availability_hours, 10); 