/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // Comma-separated list of admin emails for override (e.g. "teacher@test.com,admin@site.com")
  readonly VITE_ADMIN_EMAILS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}