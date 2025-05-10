-- Add availability_hours column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS availability_hours INTEGER CHECK (availability_hours >= 0 AND availability_hours <= 40);

-- Update existing profiles with a default value
UPDATE public.profiles 
SET availability_hours = 10 
WHERE availability_hours IS NULL; 