import { createSSRClient } from './server'

// Returns the Supabase profile UUID for the authenticated user, or null.
// Uses Supabase Auth session from cookies → looks up profiles by auth_user_id.
export async function getAuthenticatedProfileId(): Promise<string | null> {
  try {
    const supabase = await createSSRClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Look up the profile by auth_user_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    return profile?.id ?? null
  } catch {
    return null
  }
}
