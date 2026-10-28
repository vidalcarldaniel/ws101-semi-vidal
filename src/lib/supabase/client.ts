import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components (browser).
 * Uses the anon key — access is governed by Row Level Security policies
 * defined in supabase/migrations/20261027000001_init.sql.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
