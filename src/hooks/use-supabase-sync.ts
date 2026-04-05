'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSeoStore } from '@/lib/store';
import type { ArticleStatusId } from '@/types/scoring';

// Hydrates the Zustand store from Supabase on mount (if user is logged in).
// Also provides sync helpers for article statuses.
export function useSupabaseSync() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [isHydrating, setIsHydrating] = useState(false);

  // Hydrate pages + statuses from Supabase on mount
  useEffect(() => {
    // Wait for auth to finish loading before deciding
    if (authLoading) return;

    if (!isLoggedIn) {
      useSeoStore.getState().setIsHydrated(true);
      return;
    }

    const store = useSeoStore.getState();

    // Skip if store already has data from localStorage
    if (store.pages.length > 0) {
      store.setIsHydrated(true);
      return;
    }

    let cancelled = false;
    setIsHydrating(true);

    async function hydrate() {
      try {
        // Fetch pages and statuses in parallel
        const [pagesRes, statusesRes] = await Promise.all([
          fetch('/api/supabase/pages'),
          fetch('/api/supabase/statuses'),
        ]);

        if (cancelled) return;

        const store = useSeoStore.getState();

        if (pagesRes.ok) {
          const data = await pagesRes.json();
          if (data.pages?.length > 0) {
            const statuses: Record<string, { status: ArticleStatusId; updatedAt: string }> = {};

            if (statusesRes.ok) {
              const statusData = await statusesRes.json();
              if (statusData.statuses) {
                Object.assign(statuses, statusData.statuses);
              }
            }

            store.hydrateFromSupabase({
              pages: data.pages,
              overview: data.overview,
              articleStatuses: statuses,
              importId: data.importId,
            });

            // Restore GSC connection state if it was a GSC import
            if (data.source === 'gsc' && data.propertyUrl) {
              store.setGscConnection({
                property: data.propertyUrl,
                dataSource: 'gsc',
                connectedAt: new Date().toISOString(),
                dateRange: data.dateRangeStart && data.dateRangeEnd
                  ? { startDate: data.dateRangeStart, endDate: data.dateRangeEnd }
                  : null,
              });
            }

            return;
          }
        }

        // No Supabase data — pages are memory-only, nothing to migrate
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
    async (url: string, status: ArticleStatusId) => {
      // Instant local update
      useSeoStore.getState().setArticleStatus(url, status);

      // Persist to Supabase if logged in
      if (!isLoggedIn) return;

      try {
        await fetch('/api/supabase/statuses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, status }),
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
