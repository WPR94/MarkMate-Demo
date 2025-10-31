import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
