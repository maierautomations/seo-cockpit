'use client';

import { useState, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { useSeoStore } from '@/lib/store';
import type { GscSite } from '@/types/gsc-api';
import type { ScoredPage } from '@/types/scoring';
import type { DashboardOverview } from '@/types/gsc';

type LoadingStep =
  | 'connecting'
  | 'loading-sites'
  | 'loading-data'
  | 'scoring'
  | 'done'
  | null;

const STEP_LABELS: Record<NonNullable<LoadingStep>, string> = {
  connecting: 'Verbinde mit GSC...',
  'loading-sites': 'Lade Properties...',
  'loading-data': 'Lade Suchdaten...',
  scoring: 'Berechne Scores...',
  done: 'Fertig!',
};

export function useGsc() {
  const [sites, setSites] = useState<GscSite[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>(null);
  const [totalRows, setTotalRows] = useState<number | null>(null);

  const { setPages, setOverview, setGscConnection, disconnectGsc } =
    useSeoStore();

  const fetchSites = useCallback(async () => {
    setSitesLoading(true);
    setError(null);
    setLoadingStep('loading-sites');

    try {
      const response = await fetch('/api/gsc/sites');

      if (response.status === 401) {
        setError('Nicht angemeldet. Bitte zuerst mit Google verbinden.');
        return;
      }

      if (response.status === 403) {
        setError('Sitzung abgelaufen. Bitte erneut verbinden.');
        return;
      }

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? 'Fehler beim Laden der Properties.');
        return;
      }

      const data = (await response.json()) as { sites: GscSite[] };
      setSites(data.sites);
    } catch (error) {
      console.error('[GSC] Sites fetch error:', error);
      setError(error instanceof TypeError
        ? 'Netzwerkfehler. Bitte Internetverbindung prüfen.'
        : 'Verbindungsfehler. Details in der Browser-Konsole.');
    } finally {
      setSitesLoading(false);
      setLoadingStep(null);
    }
  }, []);

  const loadData = useCallback(
    async (siteUrl: string, startDate: string, endDate: string, datePreset?: string) => {
      setDataLoading(true);
      setError(null);
      setTotalRows(null);
      setLoadingStep('loading-data');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);

      try {
        const response = await fetch('/api/gsc/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteUrl, startDate, endDate }),
          signal: controller.signal,
        });

        if (response.status === 401) {
          setError('Nicht angemeldet. Bitte zuerst mit Google verbinden.');
          return;
        }

        if (response.status === 403) {
          setError('Sitzung abgelaufen. Bitte erneut verbinden.');
          return;
        }

        if (!response.ok) {
          let message = 'Fehler beim Laden der Suchdaten.';
          try {
            const errData = (await response.json()) as { error?: string };
            if (errData.error) message = errData.error;
          } catch { /* response body not JSON */ }
          console.error('[GSC] API error:', response.status, message);
          setError(message);
          return;
        }

        setLoadingStep('scoring');

        let data: {
          pages: ScoredPage[];
          overview: DashboardOverview;
          totalRows: number;
          importId: string | null;
        };

        try {
          data = await response.json();
        } catch (parseError) {
          console.error('[GSC] Failed to parse API response:', parseError);
          setError('Ungültige Server-Antwort. Bitte erneut versuchen.');
          return;
        }

        setPages(data.pages);
        setOverview(data.overview);
        setTotalRows(data.totalRows);
        if (data.importId) {
          useSeoStore.getState().setCurrentImportId(data.importId);
        }
        setGscConnection({
          property: siteUrl,
          dateRange: { startDate, endDate },
          connectedAt: new Date().toISOString(),
          dataSource: 'gsc',
          datePreset,
        });

        setLoadingStep('done');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          setError('Zeitüberschreitung — versuche einen kürzeren Zeitraum.');
        } else if (error instanceof TypeError) {
          console.error('[GSC] Network error:', error);
          setError('Netzwerkfehler. Bitte Internetverbindung prüfen.');
        } else {
          console.error('[GSC] Unexpected error:', error);
          setError('Unerwarteter Fehler. Details in der Browser-Konsole.');
        }
      } finally {
        clearTimeout(timeout);
        setDataLoading(false);
        // Keep 'done' step visible briefly before clearing
        setTimeout(() => setLoadingStep(null), 1500);
      }
    },
    [setPages, setOverview, setGscConnection],
  );

  const disconnect = useCallback(async () => {
    disconnectGsc();
    await signOut({ redirect: false });
    setSites([]);
    setTotalRows(null);
  }, [disconnectGsc]);

  return {
    sites,
    sitesLoading,
    dataLoading,
    error,
    loadingStep,
    loadingStepLabel: loadingStep ? STEP_LABELS[loadingStep] : null,
    totalRows,
    fetchSites,
    loadData,
    disconnect,
  };
}
