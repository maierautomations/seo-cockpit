'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RawQueryRow, RawPageRow, DashboardOverview } from '@/types/gsc';
import type { ScoredPage, ArticleStatusId, ArticleStatus } from '@/types/scoring';
import type { CsvParseResult } from '@/types/csv';
import type { ArticleAnalysis } from '@/types/analysis';

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
  setActiveAnalysis: (analysis: ArticleAnalysis | null) => void;
  setAnalysisLoading: (loading: boolean) => void;

  // Upload timestamp for session persistence
  lastUploadAt: string | null;
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
      setActiveAnalysis: (analysis) => set({ activeAnalysis: analysis }),
      setAnalysisLoading: (loading) => set({ analysisLoading: loading }),

      // Timestamp
      lastUploadAt: null,
    }),
    {
      name: 'seo-cockpit-store',
      partialize: (state) => ({
        queryCsv: state.queryCsv,
        pageCsv: state.pageCsv,
        pages: state.pages,
        overview: state.overview,
        lastUploadAt: state.lastUploadAt,
        articleStatuses: state.articleStatuses,
      }),
    },
  ),
);
