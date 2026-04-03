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
import { Upload } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/use-auth';
import { GscConnectButton } from '@/components/gsc/gsc-connect-button';
import { PropertySelector } from '@/components/gsc/property-selector';
import { GscStatusBanner } from '@/components/gsc/gsc-status-banner';
import { useSupabaseSync } from '@/hooks/use-supabase-sync';
import { DemoBanner } from '@/components/shared/demo-banner';
import type { DashboardFilters } from '@/types/dashboard';
import type { CategoryId, ArticleStatusId } from '@/types/scoring';

export function DashboardShell() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const { pages, overview, lastUploadAt, articleStatuses, gscConnection, isHydrated } = useSeoStore();
  const { data: session } = useSession(); // NextAuth session — for GSC access token only
  const { isLoggedIn: isSupabaseLoggedIn, isDemo } = useAuth();
  const { isHydrating } = useSupabaseSync();
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
      {isDemo && <DemoBanner />}

      <main className="flex-1">
        {isHydrating && !hasData ? (
          <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-signal border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Lade gespeicherte Daten...</p>
            </div>
          </div>
        ) : hasData ? (
          <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">
            {gscConnection.dataSource === 'gsc' ? (
              <GscStatusBanner />
            ) : (
              lastUploadAt && (
                <p className="text-xs text-muted-foreground">
                  Letzte Analyse: {new Date(lastUploadAt).toLocaleString('de-DE')}
                </p>
              )
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
        ) : isSupabaseLoggedIn && session?.accessToken ? (
          // Logged in + GSC connected but no data yet: show property selector
          <div className="hero-gradient min-h-[calc(100vh-65px)] flex items-center justify-center px-6">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-signal/20 bg-signal/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-signal">
                  Google Search Console verbunden
                </p>
                <h1 className="text-2xl md:text-3xl font-semibold leading-tight tracking-tight text-foreground mb-3">
                  Property und Zeitraum wählen
                </h1>
                <p className="text-sm text-muted-foreground">
                  Wähle eine Property und den Analysezeitraum, um deine Daten zu laden.
                </p>
              </div>

              <PropertySelector />

              {/* CSV fallback */}
              <button
                onClick={() => setUploadOpen(true)}
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-4 decoration-border"
              >
                Oder CSV-Dateien hochladen
              </button>
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
          SEO-Nachoptimierungs-Cockpit
        </p>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-foreground mb-5">
          Welche Artikel musst du
          <span className="text-signal italic"> diese Woche</span> anfassen?
        </h1>

        <p className="text-lg font-light leading-relaxed text-muted-foreground max-w-xl mx-auto mb-10">
          Verbinde deine Google Search Console und erfahre in 30 Sekunden,
          welche Artikel das größte Optimierungspotenzial haben.
        </p>

        {/* Primary: GSC Connect */}
        <GscConnectButton />

        {/* Divider */}
        <div className="flex items-center gap-4 max-w-lg mx-auto my-8">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-xs text-muted-foreground/50 uppercase tracking-widest">oder</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Secondary: CSV Upload */}
        <button
          onClick={onUpload}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Upload className="w-4 h-4" />
          CSV-Dateien manuell hochladen
        </button>

        {/* Shortcut hint */}
        <p className="text-xs text-muted-foreground/50 mt-6">
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary text-[11px] font-mono">Cmd+U</kbd>{' '}
          für schnellen CSV-Upload
        </p>
      </div>
    </div>
  );
}
