# Admin Portal Setup Guide

## 🎉 Admin Portal is Ready!

The admin portal has been built and integrated into your app. Here's how to activate it:

---

## Step 1: Run the Database Migration

Prefer using the timestamped migration file now added: `supabase/migrations/20251120150000_profiles_and_policies.sql`

If using Supabase SQL editor:
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/hyovomyhoxhvhogfvupj
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste the contents of `supabase/migrations/20251120150000_profiles_and_policies.sql`
5. Run the query

What this does:
1. Creates `public.profiles` if missing
2. Enables Row Level Security
3. Drops any old duplicate policies
4. Re-creates clean policies for SELECT/INSERT/UPDATE
5. Adds index on admin flag

If you previously ran `add-admin-role.sql` you can still run the new migration safely (it uses IF EXISTS checks).

---

## Step 2: Ensure Your Profile Row Exists & Set Admin Flag

The app auto-creates a profile row when you log in *if* the INSERT policy exists. To verify:

```sql
SELECT id, email, is_admin FROM public.profiles WHERE email = 'your-email@example.com';
```

If no row returns, insert manually (replace values):
```sql
INSERT INTO public.profiles (id, email, full_name, is_admin)
VALUES ('<auth_user_uuid>', 'your-email@example.com', NULL, TRUE)
ON CONFLICT (id) DO NOTHING;
```

To promote yourself to admin later:
```sql
UPDATE public.profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';
```

After changing admin flag: logout and login again to refresh the session.

---

## Step 3: Access the Admin Portal

Once you're marked as admin:

1. You'll see an **"Admin"** link in the navbar (orange color)
2. Click it to access the admin dashboard
3. Available pages:
   - `/admin` - Overview dashboard
   - `/admin/users` - User management
   - `/admin/analytics` - Platform analytics

---

## Admin Portal Features

### Admin Dashboard (`/admin`)
- Total users and new signups
- Essays graded (total and this week)
- Active rubrics and average score
- Estimated OpenAI API costs
- Recent essay activity
- Quick links to user management and analytics
- System health status

### User Management (`/admin/users`)
- View all registered teachers
- Search by email or name
- See usage stats (essays, rubrics, students per user)
- Grant/revoke admin privileges
- View signup dates

### Platform Analytics (`/admin/analytics`)
- User growth chart (last 30 days)
- Essay activity chart (last 30 days)
- Trend analysis

---

## Security Notes

✅ **Protected Routes**: Admin pages are protected by `AdminRoute` component
- Non-admin users are automatically redirected to `/dashboard`
- Must be authenticated AND have `is_admin = TRUE`

✅ **Database Security**: Row Level Security (RLS) policies ensure:
- Only admins can view all user profiles
- Regular users can only see their own data
- The `admin_platform_stats` view is restricted to admins

✅ **Session-based**: Admin status is fetched on login and stored in context

---

## Troubleshooting

**Problem**: "Admin" link doesn't appear after setting is_admin = TRUE

**Solution**: 
1. Confirm profile row exists
2. Run the UPDATE to set `is_admin = TRUE`
3. Logout / login again
4. Check console for `[AdminRoute] state` logs
5. If profile is null, re-run migration

**Problem**: Spinning loader forever / redirected

**Solution**:
- Console should show `[AuthContext] Fetching profile` then either created or loaded
- Ensure INSERT policy exists (see migration file)
- Verify `profiles` table contains your row
- Confirm `is_admin` is TRUE
- Clear cache, retry

---

## Next Steps (Optional Enhancements)

### Phase 3 Ideas:
- **Activity Logs**: Track user actions (logins, essay submissions)
- **Email Notifications**: Send announcements to all users
- **Usage Reports**: Export CSV reports for billing/analytics
- **Feature Flags**: Enable/disable features per user or globally
- **Support Tickets**: Built-in support ticket system
- **Subscription Management**: If you add paid tiers

---

## Need Help?

The admin portal follows the same patterns as the rest of your app:
- Uses Supabase for data
- Protected with RLS policies
- Dark mode support
- Mobile responsive
- Uses Recharts for visualizations

All admin pages are in:
- `src/pages/AdminDashboard.tsx`
- `src/pages/AdminUsers.tsx`
- `src/pages/AdminAnalytics.tsx`

All protection logic is in:
- `src/components/AdminRoute.tsx`
- `src/contexts/AuthContext.tsx` (profile fetching)
