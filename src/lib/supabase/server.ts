import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Server-side admin client using service role key.
// Bypasses RLS — use only in API routes where user_id is verified via NextAuth session.
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
