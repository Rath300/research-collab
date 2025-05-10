-- Add full_name and title columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS looking_for TEXT[],
ADD COLUMN IF NOT EXISTS project_preference TEXT CHECK (project_preference IN ('remote', 'local', 'hybrid')),
ADD COLUMN IF NOT EXISTS visibility TEXT CHECK (visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS availability_hours INTEGER CHECK (availability_hours >= 0 AND availability_hours <= 40);

-- Update existing profiles with default values
UPDATE public.profiles 
SET 
  full_name = CONCAT(first_name, ' ', last_name) WHERE full_name IS NULL,
  title = 'Researcher' WHERE title IS NULL,
  skills = '{}' WHERE skills IS NULL,
  looking_for = '{}' WHERE looking_for IS NULL,
  project_preference = 'remote' WHERE project_preference IS NULL,
  visibility = 'public' WHERE visibility IS NULL,
  availability_hours = 10 WHERE availability_hours IS NULL; 