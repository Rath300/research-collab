-- Add username field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username VARCHAR(20) UNIQUE;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Add constraint to ensure username is alphanumeric
ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS profiles_username_format 
  CHECK (username ~ '^[a-zA-Z0-9]+$');

-- Add comment
COMMENT ON COLUMN profiles.username IS 'Unique alphanumeric username for user identification'; 