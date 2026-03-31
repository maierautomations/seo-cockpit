'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSeoStore } from '@/lib/store';
import { matchKeywordCluster, findInternalLinkCandidates } from '@/lib/briefing/match-keywords';
import type { ContentBriefing, BriefingResponse } from '@/types/briefing';

export type BriefingStep = 'idle' | 'keywords' | 'serp' | 'generating' | 'done';

export function useBriefing() {
  const [briefing, setBriefing] = useState<ContentBriefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<BriefingStep>('idle');

  // Timer ref for step progression during API call
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const generateBriefing = useCallback(
    async (hauptkeyword: string, nebenkeywords: string[]) => {
      setLoading(true);
      setError(null);
      setBriefing(null);

      try {
        // Phase 1: Client-side keyword matching (instant)
        setStep('keywords');
        const pages = useSeoStore.getState().pages;
        const keywordCluster = matchKeywordCluster(hauptkeyword, nebenkeywords, pages);
        const internalLinkCandidates = findInternalLinkCandidates(
          hauptkeyword,
          nebenkeywords,
          pages,
        );

        // Phase 2: API call (SERP + Claude)
        setStep('serp');

        // After 5s, show "generating" step (Claude is working)
        timerRef.current = setTimeout(() => {
          setStep('generating');
        }, 5000);

        const res = await fetch('/api/briefing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hauptkeyword,
            nebenkeywords: nebenkeywords.filter(Boolean),
            keywordCluster,
            internalLinkCandidates,
          }),
        });

        // Clear the timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        const data = (await res.json()) as BriefingResponse;

        if (!data.success || !data.data) {
          throw new Error(data.error ?? 'Briefing-Generierung fehlgeschlagen.');
        }

        setBriefing(data.data);
        setStep('done');
        return { success: true as const };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unbekannter Fehler';
        setError(message);
        setStep('idle');
        return { success: false as const, error: message };
      } finally {
        setLoading(false);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    },
    [],
  );

  const resetBriefing = useCallback(() => {
    setBriefing(null);
    setError(null);
    setStep('idle');
  }, []);

  return {
    briefing,
    loading,
    error,
    step,
    generateBriefing,
    resetBriefing,
  };
}
