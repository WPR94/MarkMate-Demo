# Supabase Configuration for Simple RubriQ

## Required Settings

### 1. Authentication URL Configuration

Go to your Supabase Dashboard:
**Authentication → URL Configuration**

**Site URL:**
```
https://simplerubriq-git-main-wpr94s-projects.vercel.app
```

**Redirect URLs (Add all of these):**
```
https://simplerubriq-git-main-wpr94s-projects.vercel.app/**
http://localhost:5173/**
http://localhost:3000/**
```

### 2. Email Templates (Optional but Recommended)

Go to: **Authentication → Email Templates**

#### Confirm Signup Template:
- Update the confirmation link to use: `{{ .ConfirmationURL }}`
- This ensures users are redirected to the correct domain after email verification

#### Reset Password Template:
- Update the reset link to use: `{{ .ConfirmationURL }}`
- Users will be redirected to `/auth?reset=true` after clicking the link

### 3. Environment Variables

Ensure your `.env.local` has:
```
VITE_SUPABASE_URL=https://hyovomyhoxhvhogfvupj.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Ensure Vercel has (in project settings → Environment Variables):
```
OPENAI_API_KEY=your_openai_key_here
VITE_SUPABASE_URL=https://hyovomyhoxhvhogfvupj.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Testing Signup Flow

After configuring the above:

1. Go to: https://simplerubriq-git-main-wpr94s-projects.vercel.app/auth
2. Click "Sign up"
3. Enter email and password
4. Accept terms
5. Check your email for confirmation link
6. Click the link → should redirect to your Vercel app
7. You'll see "Email verified! Redirecting to dashboard..."
8. App automatically creates your profile and logs you in

### 5. Admin Access

To grant admin privileges, add your email to Vercel environment variables:

```
VITE_ADMIN_EMAILS=your_email@example.com
```

Or manually update the `profiles` table:
```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your_email@example.com';
```

## Troubleshooting

**Issue:** Email link redirects to localhost
- **Fix:** Update Supabase Site URL to your Vercel domain

**Issue:** 404 on email confirmation
- **Fix:** Ensure all Redirect URLs are added in Supabase settings

**Issue:** Profile not created after signup
- **Fix:** Check browser console for errors; AuthContext auto-creates profiles

**Issue:** Can't access admin features
- **Fix:** Add your email to VITE_ADMIN_EMAILS or update profiles table
