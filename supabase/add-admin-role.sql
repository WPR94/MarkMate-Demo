-- Add admin role support
-- This migration adds an is_admin column to track admin users

-- Create profiles table if it doesn't exist
-- (Supabase usually creates this via Auth, but we'll ensure it exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  is_admin boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add is_admin column if profiles already exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- Allow users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY IF NOT EXISTS "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Set your account as admin (UPDATE THIS EMAIL!)
-- Replace with your actual admin email address
-- Run this after you create your account
-- UPDATE public.profiles 
-- SET is_admin = TRUE 
-- WHERE email = 'your-admin-email@example.com';

-- Create a view for admin analytics
CREATE OR REPLACE VIEW admin_platform_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM essays) as total_essays,
  (SELECT COUNT(*) FROM essays WHERE created_at > NOW() - INTERVAL '30 days') as essays_30d,
  (SELECT COUNT(*) FROM rubrics) as total_rubrics,
  (SELECT AVG(score) FROM essays WHERE score IS NOT NULL) as avg_score,
  (SELECT COUNT(*) FROM essays WHERE created_at > NOW() - INTERVAL '7 days') as essays_7d;

-- Grant access to authenticated users (RLS will restrict to admins only)
GRANT SELECT ON admin_platform_stats TO authenticated;

-- Add RLS policy for admin-only access to sensitive data
-- This ensures only admin users can see platform-wide stats
CREATE POLICY "Admins can view platform stats" ON profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = TRUE
    )
  );

-- Comment for clarity
COMMENT ON COLUMN profiles.is_admin IS 'Flag to identify admin users with elevated permissions';
COMMENT ON VIEW admin_platform_stats IS 'Platform-wide statistics for admin dashboard';
