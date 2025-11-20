-- ALL-IN-ONE FIX for Admin Access
-- Copy this entire file and paste into Supabase SQL Editor
-- This will: create profiles table, add policies, and make your account admin

-- Step 1: Drop all existing policies first (before touching the table)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Profiles select own or admins" ON public.profiles;
  DROP POLICY IF EXISTS "Profiles insert self" ON public.profiles;
  DROP POLICY IF EXISTS "Profiles update self or admins" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
EXCEPTION WHEN undefined_table THEN
  NULL; -- Table doesn't exist yet, that's fine
END $$;

-- Step 2: Ensure table exists with ALL required columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  is_admin boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add is_admin column if the table existed but column didn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin boolean DEFAULT FALSE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create clean policies (only after table exists with all columns)
CREATE POLICY "Profiles select own or admins"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR EXISTS (
      SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.is_admin = TRUE
    )
  );

CREATE POLICY "Profiles insert self"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles update self or admins"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id OR EXISTS (
      SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.is_admin = TRUE
    )
  )
  WITH CHECK (
    auth.uid() = id OR EXISTS (
      SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.is_admin = TRUE
    )
  );

-- Step 4: Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- Step 5: Fix existing profiles to set user_id = id if needed
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

-- Step 6: Update existing profile to make it admin
-- Get your user and set is_admin to TRUE
UPDATE public.profiles
SET is_admin = TRUE, updated_at = now()
WHERE user_id = (
  SELECT id FROM auth.users 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Step 7: Verify the result
SELECT 
  id,
  user_id,
  email, 
  is_admin, 
  created_at
FROM public.profiles
WHERE is_admin = TRUE;
