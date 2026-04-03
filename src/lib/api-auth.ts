import { auth } from '@/lib/auth';

// Returns the Supabase profile UUID for the logged-in user, or null if not authenticated.
// Used by API routes that write to Supabase.
export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth();
  return session?.supabaseUserId ?? null;
}
