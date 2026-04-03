'use client';

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSeoStore } from '@/lib/store';
import type {
  FetchArticleResponse,
  AnalyzeArticleResponse,
  ArticleAnalysis,
  StructureCheck,
  SeoCheck,
  ContentAnalysis,
  AiSuggestions,
} from '@/types/analysis';
import type { ScoredPage } from '@/types/scoring';

const CACHE_MAX_AGE_DAYS = 7;

interface CachedAnalysis {
  structure: StructureCheck;
  seo: SeoCheck;
  content: ContentAnalysis | null;
  suggestions: AiSuggestions | null;
  cachedAt: string;
}

export function useArticleAnalysis() {
  const {
    activeAnalysis,
    analysisLoading,
    setActiveAnalysis,
    setAnalysisLoading,
    setAnalysisCache,
  } = useSeoStore();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.supabaseUserId;

  // Check Supabase for a cached analysis
  const checkCache = useCallback(
    async (url: string): Promise<CachedAnalysis | null> => {
      if (!isLoggedIn) return null;
      try {
        const res = await fetch(`/api/supabase/analyses?url=${encodeURIComponent(url)}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.analysis?.structure) return null;

        // Check age
        const cachedAt = new Date(data.analysis.cachedAt);
        const ageMs = Date.now() - cachedAt.getTime();
        const ageDays = ageMs / (1000 * 60 * 60 * 24);
        if (ageDays > CACHE_MAX_AGE_DAYS) return null;

        return data.analysis as CachedAnalysis;
      } catch {
        return null;
      }
    },
    [isLoggedIn],
  );

  // Step 1: Fetch article and run structure/SEO checks (no AI)
  // Checks Supabase cache first if logged in
  const analyzeArticle = useCallback(
    async (page: ScoredPage, skipCache = false) => {
      setAnalysisLoading(true);
      setActiveAnalysis(null);
      setAnalysisCache(false, null);

      try {
        // Check Supabase cache (only if we have AI results cached)
        if (!skipCache) {
          const cached = await checkCache(page.url);
          if (cached?.content && cached?.suggestions) {
            const cachedAnalysis: ArticleAnalysis = {
              url: page.url,
              title: '',
              fetchedAt: cached.cachedAt,
              structure: cached.structure,
              seo: cached.seo,
              content: cached.content,
              suggestions: cached.suggestions,
              markdownContent: '',
            };
            setActiveAnalysis(cachedAnalysis);
            setAnalysisCache(true, cached.cachedAt);
            return { success: true };
          }
        }

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
            aiAnalysis: false,
          }),
        });

        const analyzeData = (await analyzeRes.json()) as AnalyzeArticleResponse;
        if (!analyzeData.success || !analyzeData.data) {
          throw new Error(analyzeData.error ?? 'Analyse fehlgeschlagen.');
        }

        setActiveAnalysis(analyzeData.data);
        setAnalysisCache(false, null);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
        return { success: false, error: message };
      } finally {
        setAnalysisLoading(false);
      }
    },
    [setActiveAnalysis, setAnalysisLoading, setAnalysisCache, checkCache],
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

  // Re-analyze: skip cache, fetch fresh article + analysis
  const reanalyze = useCallback(
    async (page: ScoredPage) => {
      setAnalysisCache(false, null);
      return analyzeArticle(page, true);
    },
    [analyzeArticle, setAnalysisCache],
  );

  return {
    activeAnalysis,
    analysisLoading,
    analyzeArticle,
    runAiAnalysis,
    reanalyze,
  };
}
