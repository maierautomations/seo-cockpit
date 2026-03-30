'use client';

import { useState, useCallback } from 'react';
import type { SerpAnalysis, SerpAnalysisResponse } from '@/types/serp';

export function useSerpAnalysis() {
  const [serpAnalysis, setSerpAnalysis] = useState<SerpAnalysis | null>(null);
  const [serpLoading, setSerpLoading] = useState(false);
  const [serpError, setSerpError] = useState<string | null>(null);

  const runSerpAnalysis = useCallback(
    async (keyword: string, ownUrl?: string, ownContent?: string) => {
      setSerpLoading(true);
      setSerpError(null);
      setSerpAnalysis(null);

      try {
        const res = await fetch('/api/serp-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword, ownUrl, ownContent }),
        });

        const data = (await res.json()) as SerpAnalysisResponse;

        if (!data.success || !data.data) {
          throw new Error(data.error ?? 'SERP-Analyse fehlgeschlagen');
        }

        setSerpAnalysis(data.data);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
        setSerpError(message);
        return { success: false, error: message };
      } finally {
        setSerpLoading(false);
      }
    },
    [],
  );

  const resetSerp = useCallback(() => {
    setSerpAnalysis(null);
    setSerpError(null);
  }, []);

  return {
    serpAnalysis,
    serpLoading,
    serpError,
    runSerpAnalysis,
    resetSerp,
  };
}
