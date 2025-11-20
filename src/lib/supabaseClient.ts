import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  // Surface a clear error rather than silent failure
  console.error(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check .env.local or .env file.'
  );
}

export const supabase = createClient(supabaseUrl || 'https://invalid.local', supabaseAnonKey || 'invalid');

// Simple connectivity check (non-blocking); logs to console in dev
export async function testSupabaseConnection(): Promise<void> {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
    // If we got here, the client initialized and a request succeeded
    console.log("✅ Supabase connected successfully");
  } catch (err) {
    console.error("❌ Supabase connection failed", err);
  }
}
