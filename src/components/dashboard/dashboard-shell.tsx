'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSeoStore } from '@/lib/store';
import { filterAndSortPages } from '@/lib/filter-pages';
import { DEFAULT_FILTERS } from '@/types/dashboard';
import { Header } from '@/components/shared/header';
import { UploadDialog } from '@/components/upload/upload-dialog';
import { KpiCards } from './kpi-cards';
import { TopCandidates } from './top-candidates';
import { CategorySummary } from './category-summary';
import { StatusOverview } from './status-overview';
import { FilterBar } from './filter-bar';
import { ArticleList } from './article-list';
import { Separator } from '@/components/ui/separator';
import { FileUp, FileText } from 'lucide-react';
import type { DashboardFilters } from '@/types/dashboard';
import type { CategoryId, ArticleStatusId } from '@/types/scoring';

export function DashboardShell() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const { pages, overview, lastUploadAt, articleStatuses } = useSeoStore();
  const hasData = pages.length > 0 && overview !== null;

  // Keyboard shortcut: Cmd+U to open upload dialog
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault();
        setUploadOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFilterChange = useCallback((partial: Partial<DashboardFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...partial,
      // Reset page when any filter changes (unless page itself is being set)
      page: 'page' in partial ? (partial.page ?? 0) : 0,
    }));
  }, []);

  // Category click from sidebar: toggle filter
  const handleCategoryClick = useCallback((category: CategoryId) => {
    setFilters((prev) => {
      const has = prev.categories.includes(category);
      return {
        ...prev,
        categories: has
          ? prev.categories.filter((c) => c !== category)
          : [...prev.categories, category],
        page: 0,
      };
    });
  }, []);

  // Status click from overview: toggle filter
  const handleStatusClick = useCallback((status: ArticleStatusId) => {
    setFilters((prev) => {
      const has = prev.statuses.includes(status);
      return {
        ...prev,
        statuses: has
          ? prev.statuses.filter((s) => s !== status)
          : [...prev.statuses, status],
        page: 0,
      };
    });
  }, []);

  // Filtered + sorted pages for the full list
  const filteredPages = useMemo(
    () => filterAndSortPages(pages, articleStatuses, filters),
    [pages, articleStatuses, filters],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header onUploadClick={() => setUploadOpen(true)} />

      <main className="flex-1">
        {hasData ? (
          <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">
            {lastUploadAt && (
              <p className="text-xs text-muted-foreground">
                Letzte Analyse: {new Date(lastUploadAt).toLocaleString('de-DE')}
              </p>
            )}

            <KpiCards overview={overview} />

            <StatusOverview
              pages={pages}
              articleStatuses={articleStatuses}
              activeStatuses={filters.statuses}
              onStatusClick={handleStatusClick}
            />

            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
              <TopCandidates pages={pages} />
              <CategorySummary
                pages={pages}
                activeCategories={filters.categories}
                onCategoryClick={handleCategoryClick}
              />
            </div>

            <Separator className="opacity-40" />

            {/* Full article list with filters */}
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">Alle Artikel</h2>
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                totalResults={filteredPages.length}
                totalPages={pages.length}
              />
              <ArticleList
                pages={filteredPages}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>
        ) : (
          <EmptyState onUpload={() => setUploadOpen(true)} />
        )}
      </main>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="hero-gradient min-h-[calc(100vh-65px)] flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Badge */}
        <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-signal/20 bg-signal/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-signal">
          Phase 1 — Nachoptimierungs-Cockpit
        </p>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-foreground mb-5">
          Welche Artikel musst du
          <span className="text-signal italic"> diese Woche</span> anfassen?
        </h1>

        <p className="text-lg font-light leading-relaxed text-muted-foreground max-w-xl mx-auto mb-10">
          Lade deine Google Search Console CSV-Daten hoch und erfahre in 30 Sekunden,
          welche Artikel das grosste Optimierungspotenzial haben.
        </p>

        {/* Upload zone */}
        <button
          onClick={onUpload}
          className="group relative w-full max-w-lg mx-auto block rounded-2xl border-2 border-dashed border-border hover:border-signal/40 bg-card/50 hover:bg-card/80 transition-all duration-300 p-10 cursor-pointer"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-signal/10 border border-signal/20 flex items-center justify-center group-hover:bg-signal/15 group-hover:border-signal/30 transition-all">
              <FileUp className="w-7 h-7 text-signal" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground mb-1">
                CSV-Dateien hochladen
              </p>
              <p className="text-sm text-muted-foreground">
                Ziehe deine Dateien hierher oder klicke zum Auswahlen
              </p>
            </div>
          </div>
        </button>

        {/* CSV hint cards */}
        <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto mt-6">
          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/30 p-4 text-left">
            <FileText className="w-4.5 h-4.5 text-signal/70 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">Seiten-CSV</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                Seite, Klicks, Impressionen, CTR, Position
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/30 p-4 text-left">
            <FileText className="w-4.5 h-4.5 text-signal/70 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">Suchanfragen-CSV</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                Suchanfrage, Klicks, Impressionen, CTR, Position
              </p>
            </div>
          </div>
        </div>

        {/* Shortcut hint */}
        <p className="text-xs text-muted-foreground mt-8">
          Tipp: <kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary text-[11px] font-mono">Cmd+U</kbd> fur schnellen Upload
        </p>
      </div>
    </div>
  );
}
