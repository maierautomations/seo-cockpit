'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RawQueryRow, RawPageRow, DashboardOverview } from '@/types/gsc';
import type { ScoredPage, ArticleStatusId, ArticleStatus } from '@/types/scoring';
import type { CsvParseResult } from '@/types/csv';
import type { ArticleAnalysis } from '@/types/analysis';
import type { GscConnectionState } from '@/types/gsc-api';

interface SeoStore {
  // CSV upload state
  queryCsv: CsvParseResult<RawQueryRow> | null;
  pageCsv: CsvParseResult<RawPageRow> | null;
  setQueryCsv: (result: CsvParseResult<RawQueryRow>) => void;
  setPageCsv: (result: CsvParseResult<RawPageRow>) => void;
  resetUpload: () => void;

  // Scored data (derived from CSV)
  pages: ScoredPage[];
  overview: DashboardOverview | null;
  setPages: (pages: ScoredPage[]) => void;
  setOverview: (overview: DashboardOverview) => void;

  // Article status tracking (keyed by URL)
  articleStatuses: Record<string, ArticleStatus>;
  setArticleStatus: (url: string, status: ArticleStatusId) => void;

  // Article analysis
  activeAnalysis: ArticleAnalysis | null;
  analysisLoading: boolean;
  analysisFromCache: boolean;
  analysisCachedAt: string | null;
  setActiveAnalysis: (analysis: ArticleAnalysis | null) => void;
  setAnalysisLoading: (loading: boolean) => void;
  setAnalysisCache: (fromCache: boolean, cachedAt: string | null) => void;

  // Upload timestamp for session persistence
  lastUploadAt: string | null;

  // GSC connection state
  gscConnection: GscConnectionState;
  setGscConnection: (connection: Partial<GscConnectionState>) => void;
  disconnectGsc: () => void;

  // Supabase sync state
  currentImportId: string | null;
  isHydrated: boolean;
  setCurrentImportId: (id: string | null) => void;
  setIsHydrated: (hydrated: boolean) => void;
  hydrateFromSupabase: (data: {
    pages: ScoredPage[];
    overview: DashboardOverview;
    articleStatuses: Record<string, ArticleStatus>;
    importId: string | null;
  }) => void;
}

// One-time migration: clear oversized localStorage entries from old schema
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('seo-cockpit-store');
    if (raw && raw.length > 500_000) {
      localStorage.removeItem('seo-cockpit-store');
      console.warn('[store] Cleared oversized localStorage entry (%d KB)', Math.round(raw.length / 1024));
    }
  } catch {
    // Ignore — localStorage may be inaccessible
  }
}

export const useSeoStore = create<SeoStore>()(
  persist(
    (set) => ({
      // CSV
      queryCsv: null,
      pageCsv: null,
      setQueryCsv: (result) => set({ queryCsv: result }),
      setPageCsv: (result) => set({ pageCsv: result }),
      resetUpload: () =>
        set({
          queryCsv: null,
          pageCsv: null,
          pages: [],
          overview: null,
          activeAnalysis: null,
          lastUploadAt: null,
        }),

      // Scored pages
      pages: [],
      overview: null,
      setPages: (pages) => set({ pages }),
      setOverview: (overview) => set({ overview, lastUploadAt: new Date().toISOString() }),

      // Article statuses
      articleStatuses: {},
      setArticleStatus: (url, status) =>
        set((state) => ({
          articleStatuses: {
            ...state.articleStatuses,
            [url]: { status, updatedAt: new Date().toISOString() },
          },
        })),

      // Analysis
      activeAnalysis: null,
      analysisLoading: false,
      analysisFromCache: false,
      analysisCachedAt: null,
      setActiveAnalysis: (analysis) => set({ activeAnalysis: analysis }),
      setAnalysisLoading: (loading) => set({ analysisLoading: loading }),
      setAnalysisCache: (fromCache, cachedAt) =>
        set({ analysisFromCache: fromCache, analysisCachedAt: cachedAt }),

      // Timestamp
      lastUploadAt: null,

      // GSC connection
      gscConnection: {
        property: null,
        dateRange: null,
        connectedAt: null,
        dataSource: 'csv',
      },
      setGscConnection: (connection) =>
        set((state) => ({
          gscConnection: { ...state.gscConnection, ...connection },
        })),
      disconnectGsc: () =>
        set({
          gscConnection: {
            property: null,
            dateRange: null,
            connectedAt: null,
            dataSource: 'csv',
          },
          pages: [],
          overview: null,
          activeAnalysis: null,
          lastUploadAt: null,
        }),

      // Supabase sync
      currentImportId: null,
      isHydrated: false,
      setCurrentImportId: (id) => set({ currentImportId: id }),
      setIsHydrated: (hydrated) => set({ isHydrated: hydrated }),
      hydrateFromSupabase: (data) =>
        set({
          pages: data.pages,
          overview: data.overview,
          articleStatuses: data.articleStatuses,
          currentImportId: data.importId,
          isHydrated: true,
          lastUploadAt: new Date().toISOString(),
        }),
    }),
    {
      name: 'seo-cockpit-store',
      // Only persist lightweight data — heavy data (pages, CSV) lives in memory
      // and is rehydrated from Supabase for logged-in users
      partialize: (state) => ({
        overview: state.overview,
        lastUploadAt: state.lastUploadAt,
        articleStatuses: state.articleStatuses,
        gscConnection: state.gscConnection,
        currentImportId: state.currentImportId,
      }),
      onRehydrateStorage: () => (_, error) => {
        if (error) {
          console.warn('[store] Rehydration failed, clearing localStorage:', error);
          try { localStorage.removeItem('seo-cockpit-store'); } catch { /* ignore */ }
        }
      },
    },
  ),
);
