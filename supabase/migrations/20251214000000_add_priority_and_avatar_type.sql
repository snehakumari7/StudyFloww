-- Add priority column to tasks table
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high'));

-- Add avatar_type column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_type TEXT CHECK (avatar_type IN ('panda', 'custom'));

