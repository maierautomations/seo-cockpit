'use client';

import { useCallback } from 'react';
import { useSeoStore } from '@/lib/store';
import type { FetchArticleResponse, AnalyzeArticleResponse } from '@/types/analysis';
import type { ScoredPage } from '@/types/scoring';

export function useArticleAnalysis() {
  const {
    activeAnalysis,
    analysisLoading,
    setActiveAnalysis,
    setAnalysisLoading,
  } = useSeoStore();

  // Step 1: Fetch article and run structure/SEO checks (no AI)
  const analyzeArticle = useCallback(
    async (page: ScoredPage) => {
      setAnalysisLoading(true);
      setActiveAnalysis(null);

      try {
        // Fetch article content
        const fetchRes = await fetch('/api/fetch-article', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: page.url }),
        });

        const fetchData = (await fetchRes.json()) as FetchArticleResponse;
        if (!fetchData.success || !fetchData.markdown) {
          throw new Error(fetchData.error ?? 'Artikel konnte nicht geladen werden.');
        }

        // Run structure + SEO analysis (no AI yet)
        const mainKeyword = page.keywords[0]?.keyword ?? '';
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: page.url,
            mainKeyword,
            keywords: page.keywords.map((k) => k.keyword),
            category: page.category,
            markdown: fetchData.markdown,
            title: fetchData.title,
            metaDescription: fetchData.metaDescription,
            aiAnalysis: false, // Progressive Disclosure: no AI yet
          }),
        });

        const analyzeData = (await analyzeRes.json()) as AnalyzeArticleResponse;
        if (!analyzeData.success || !analyzeData.data) {
          throw new Error(analyzeData.error ?? 'Analyse fehlgeschlagen.');
        }

        setActiveAnalysis(analyzeData.data);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
        return { success: false, error: message };
      } finally {
        setAnalysisLoading(false);
      }
    },
    [setActiveAnalysis, setAnalysisLoading],
  );

  // Step 2: Trigger AI analysis (content + suggestions)
  const runAiAnalysis = useCallback(async () => {
    if (!activeAnalysis) return { success: false, error: 'Keine Analyse vorhanden.' };

    setAnalysisLoading(true);

    try {
      const page = useSeoStore.getState().pages.find((p) => p.url === activeAnalysis.url);
      const mainKeyword = page?.keywords[0]?.keyword ?? '';

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: activeAnalysis.url,
          mainKeyword,
          keywords: page?.keywords.map((k) => k.keyword) ?? [],
          category: page?.category ?? 'content-problem',
          markdown: activeAnalysis.markdownContent,
          title: activeAnalysis.title,
          metaDescription: activeAnalysis.seo.metaDescription.text,
          aiAnalysis: true,
          position: page?.position,
          impressionen: page?.impressionen,
          ctr: page?.ctr,
        }),
      });

      const data = (await res.json()) as AnalyzeArticleResponse;
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'KI-Analyse fehlgeschlagen.');
      }

      setActiveAnalysis(data.data);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      return { success: false, error: message };
    } finally {
      setAnalysisLoading(false);
    }
  }, [activeAnalysis, setActiveAnalysis, setAnalysisLoading]);

  return {
    activeAnalysis,
    analysisLoading,
    analyzeArticle,
    runAiAnalysis,
  };
}
