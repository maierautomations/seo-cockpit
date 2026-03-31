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
    } catch {
      setError('Verbindungsfehler. Bitte erneut versuchen.');
    } finally {
      setSitesLoading(false);
      setLoadingStep(null);
    }
  }, []);

  const loadData = useCallback(
    async (siteUrl: string, startDate: string, endDate: string) => {
      setDataLoading(true);
      setError(null);
      setTotalRows(null);
      setLoadingStep('loading-data');

      try {
        const response = await fetch('/api/gsc/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteUrl, startDate, endDate }),
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
          const data = (await response.json()) as { error?: string };
          setError(data.error ?? 'Fehler beim Laden der Suchdaten.');
          return;
        }

        setLoadingStep('scoring');

        const data = (await response.json()) as {
          pages: ScoredPage[];
          overview: DashboardOverview;
          totalRows: number;
        };

        setPages(data.pages);
        setOverview(data.overview);
        setTotalRows(data.totalRows);
        setGscConnection({
          property: siteUrl,
          dateRange: { startDate, endDate },
          connectedAt: new Date().toISOString(),
          dataSource: 'gsc',
        });

        setLoadingStep('done');
      } catch {
        setError('Verbindungsfehler. Bitte erneut versuchen.');
      } finally {
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
