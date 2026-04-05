'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSeoStore } from '@/lib/store';
import type { PageTypeSettings } from '@/types/page-type-filter';

/**
 * Syncs page type settings with Supabase.
 * On mount: fetches from Supabase (if logged in) and merges into store.
 * On update: writes to store (instant) + persists to Supabase (async).
 */
export function usePageTypeSettings() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { pageTypeSettings, setPageTypeSettings } = useSeoStore();

  // Hydrate from Supabase on mount
  useEffect(() => {
    if (authLoading || !isLoggedIn) return;

    async function loadSettings() {
      try {
        const res = await fetch('/api/supabase/settings');
        if (!res.ok) return;

        const data = await res.json();
        if (data.settings?.pageTypeSettings) {
          setPageTypeSettings(data.settings.pageTypeSettings);
        }
      } catch {
        // Silently fail — localStorage has the settings
      }
    }

    loadSettings();
  }, [isLoggedIn, authLoading, setPageTypeSettings]);

  // Update settings: instant local + async Supabase persist
  const updateSettings = useCallback(
    async (settings: PageTypeSettings) => {
      setPageTypeSettings(settings);

      if (!isLoggedIn) return;

      try {
        await fetch('/api/supabase/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            settings: { pageTypeSettings: settings },
          }),
        });
      } catch {
        // Silently fail — localStorage has the settings
      }
    },
    [isLoggedIn, setPageTypeSettings],
  );

  return {
    settings: pageTypeSettings,
    updateSettings,
  };
}
