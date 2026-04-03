'use client';

import { useAuthContext } from '@/components/providers/supabase-auth-provider';

// Drop-in replacement for useSession() from next-auth.
// Returns Supabase Auth user state + profile data.
export function useAuth() {
  return useAuthContext();
}
