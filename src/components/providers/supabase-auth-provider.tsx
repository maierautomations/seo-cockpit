'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isLoggedIn: boolean;
  isDemo: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isLoggedIn: false,
  isDemo: false,
  isLoading: true,
  signOut: async () => {},
});

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Check for demo mode from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === 'true') {
        setIsDemo(true);
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch the profile for a given auth user (auto-create if trigger failed)
  const fetchProfile = useCallback(async (authUser: User) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, email, display_name, avatar_url')
      .eq('auth_user_id', authUser.id)
      .single();

    if (data) {
      setProfile(data);
      return;
    }

    // Fallback: create profile if DB trigger didn't fire
    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert(
        {
          auth_user_id: authUser.id,
          email: authUser.email ?? null,
          display_name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null,
          avatar_url: authUser.user_metadata?.avatar_url ?? null,
        },
        { onConflict: 'auth_user_id' },
      )
      .select('id, email, display_name, avatar_url')
      .single();

    if (newProfile) {
      setProfile(newProfile);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const supabase = createClient();

    // Get current session
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        if (newUser) {
          fetchProfile(newUser);
        } else {
          setProfile(null);
        }
        // Clear demo mode on login
        if (newUser) {
          setIsDemo(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const isLoggedIn = !!user && !!profile;

  return (
    <AuthContext value={{ user, profile, isLoggedIn, isDemo, isLoading, signOut }}>
      {children}
    </AuthContext>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
