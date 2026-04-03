import { getAuthenticatedProfileId } from '@/lib/supabase/auth';

// Returns the Supabase profile UUID for the logged-in user, or null if not authenticated.
// Used by API routes that write to Supabase.
// Uses Supabase Auth (not NextAuth) — all API routes auto-migrate via this function.
export async function getAuthenticatedUserId(): Promise<string | null> {
  return getAuthenticatedProfileId();
}
