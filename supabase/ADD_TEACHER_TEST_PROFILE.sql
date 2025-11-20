-- Provision teacher@test.com as admin
-- Run in Supabase SQL Editor AFTER the user has signed up via the app (so auth.users has the email)

DO $$
DECLARE
  target_email text := 'teacher@test.com';
  u uuid;
BEGIN
  SELECT id INTO u FROM auth.users WHERE email = target_email LIMIT 1;
  IF u IS NULL THEN
    RAISE NOTICE 'User % not found in auth.users. Sign up first in the application UI.', target_email;
    RETURN;
  END IF;

  -- Try to update existing profile row
  UPDATE public.profiles
    SET user_id = u,
        email = target_email,
        is_admin = TRUE,
        updated_at = now()
  WHERE user_id = u OR id = u;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, user_id, email, is_admin, created_at, updated_at)
    VALUES (u, u, target_email, TRUE, now(), now());
    RAISE NOTICE 'Inserted new admin profile for % (%).', target_email, u;
  ELSE
    RAISE NOTICE 'Updated existing profile for % (%), is_admin set TRUE.', target_email, u;
  END IF;
END $$;

-- Verify
SELECT id, user_id, email, is_admin FROM public.profiles WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'teacher@test.com' LIMIT 1
);
