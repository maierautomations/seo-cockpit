'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSeoStore } from '@/lib/store';
import type { ArticleStatusId } from '@/types/scoring';

// Hydrates article statuses from Supabase on mount (if user is logged in).
// GSC page data is always live (fetched fresh from GSC API), never from Supabase.
export function useSupabaseSync() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [isHydrating, setIsHydrating] = useState(false);

  // Hydrate statuses from Supabase on mount
  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      useSeoStore.getState().setIsHydrated(true);
      return;
    }

    let cancelled = false;
    setIsHydrating(true);

    async function hydrate() {
      try {
        const statusesRes = await fetch('/api/supabase/statuses');
        if (cancelled) return;

        const store = useSeoStore.getState();

        if (statusesRes.ok) {
          const statusData = await statusesRes.json();
          if (statusData.statuses) {
            // Merge Supabase statuses into store
            const currentStatuses = store.articleStatuses;
            const merged = { ...currentStatuses, ...statusData.statuses };
            // Apply each status from Supabase
            for (const [url, status] of Object.entries(statusData.statuses)) {
              const s = status as { status: ArticleStatusId; updatedAt: string };
              store.setArticleStatus(url, s.status);
            }
          }
        }

        store.setIsHydrated(true);
      } catch (error) {
        console.error('Supabase hydration error:', error);
        useSeoStore.getState().setIsHydrated(true);
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    }

    hydrate();
    return () => { cancelled = true; };
  }, [isLoggedIn, authLoading]);

  // Sync article status to Supabase (optimistic local update + async persist)
  const syncArticleStatus = useCallback(
    async (
      url: string,
      status: ArticleStatusId,
      metrics?: {
        position?: number;
        ctr?: number;
        impressions?: number;
        clicks?: number;
        mainKeyword?: string;
      },
    ) => {
      // Instant local update
      useSeoStore.getState().setArticleStatus(url, status);

      // Persist to Supabase if logged in
      if (!isLoggedIn) return;

      try {
        await fetch('/api/supabase/statuses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, status, ...metrics }),
        });
      } catch {
        // Silently fail — localStorage has the status
      }
    },
    [isLoggedIn],
  );

  return {
    isHydrating,
    isLoggedIn,
    syncArticleStatus,
  };
}
