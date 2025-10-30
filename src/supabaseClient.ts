import { createClient } from '@supabase/supabase-js';

// This is a frontend client setup for Supabase
// For direct database access, use the Postgres connection in a backend environment instead

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`
    Missing Supabase credentials. Ensure you have:
    1. Created .env file
    2. Added VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
    3. Used the correct values from your Supabase project dashboard
  `);
}

// Initialize Supabase client for frontend use
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  }
});