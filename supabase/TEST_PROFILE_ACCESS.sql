-- Test profile access for debugging
-- Run this while logged in as your user to see what's happening

-- 1. Check if your profile exists
SELECT 
  id,
  user_id,
  email,
  is_admin,
  created_at
FROM public.profiles
WHERE user_id = '35596bf9-008d-4aee-85a5-9d8cbd7f31aa';

-- 2. Check all profiles (to see if data is there)
SELECT 
  id,
  user_id,
  email,
  is_admin
FROM public.profiles;

-- 3. Check what auth.uid() returns (should match your user_id)
SELECT auth.uid() as current_user_id;

-- 4. Check if RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';
