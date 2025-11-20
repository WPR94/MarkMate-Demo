-- Add missing INSERT policy for profiles to allow auto-creation
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can insert their own profile row
-- Remove unsupported IF NOT EXISTS from CREATE POLICY; drop first if present
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
