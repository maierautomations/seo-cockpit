# SEO Cockpit -- Phase 1 (MVP) TODO

## Foundation

- [x] Dependencies installieren (papaparse, @anthropic-ai/sdk, zustand, sonner)
- [x] shadcn/ui Komponenten installieren (card, badge, table, progress, tabs, skeleton, alert, tooltip, dialog, separator, sonner)
- [x] TypeScript Types erstellen (gsc.ts, scoring.ts, analysis.ts, csv.ts)
- [x] Zustand Store erstellen (src/lib/store.ts)
- [x] Format Utils erstellen (src/lib/format.ts -- deutsche Zahlenformatierung)
- [x] Layout updaten (lang="de", Metadata, Toaster)

## Modul 1: CSV-Upload & Parser

- [x] CSV Parser (src/lib/csv/parser.ts -- PapaParse, deutsches Format)
- [x] CSV Validator (src/lib/csv/validator.ts -- Spalten, Datentypen, BOM)
- [x] CSV Merger (src/lib/csv/merger.ts -- Queries + Pages → PageData[])
- [x] use-csv-upload Hook (src/hooks/use-csv-upload.ts)
- [x] CSV Upload Zone Komponente (Drag & Drop + File Picker)
- [x] Upload Dialog Komponente (Modal-Wrapper)
- [x] CSV Preview auf 5 Zeilen erweitert, "Analyse starten" Button

## Modul 2: Scoring Engine

- [x] CTR Benchmarks (src/lib/scoring/benchmarks.ts)
- [x] Kategorie-Definitionen (src/lib/scoring/categories.ts)
- [x] Scoring Engine (src/lib/scoring/engine.ts -- gewichtete Formel)
- [x] use-scoring Hook (in use-csv-upload integriert)

## Modul 3: Dashboard

- [x] App Header (src/components/shared/header.tsx)
- [x] Category Badge (src/components/shared/category-badge.tsx)
- [x] Score Bar (src/components/shared/score-bar.tsx)
- [x] KPI Cards (src/components/dashboard/kpi-cards.tsx)
- [x] Top-10 Kandidaten Liste (src/components/dashboard/top-candidates.tsx)
- [x] Kategorie-Verteilung (src/components/dashboard/category-summary.tsx)
- [x] Dashboard Shell (src/components/dashboard/dashboard-shell.tsx)
- [x] Dashboard Page rewrite (src/app/page.tsx)

## Modul 3b: Dashboard UX-Upgrade

- [x] ArticleStatus Types + Zustand Store erweitert (articleStatuses, persistiert)
- [x] DashboardFilters Type (src/types/dashboard.ts)
- [x] Status-Konfiguration (src/lib/status-config.ts)
- [x] Filter/Sort Utility (src/lib/filter-pages.ts)
- [x] StatusBadge Komponente (src/components/shared/status-badge.tsx)
- [x] StatusSelect Dropdown (src/components/shared/status-select.tsx)
- [x] Breadcrumb Komponente (src/components/shared/breadcrumb.tsx)
- [x] FilterBar Komponente (Kategorie, Impressions, Position, Status, Suche, Sortierung)
- [x] Vollstandige Artikelliste mit Pagination (src/components/dashboard/article-list.tsx)
- [x] Status-Ubersicht Zeile (src/components/dashboard/status-overview.tsx)
- [x] Klickbare Kategorie-Verteilung (filtert die Liste)
- [x] Dashboard Shell Integration (Top-10 + Alle Artikel + Filter)

## Modul 4: Artikel-Tiefenanalyse

- [x] Fetch Article API Route (src/app/api/fetch-article/route.ts)
- [x] Analyze API Route (src/app/api/analyze/route.ts)
- [x] Structure Analyzer (src/lib/analysis/structure-analyzer.ts)
- [x] SEO Analyzer (src/lib/analysis/seo-analyzer.ts)
- [x] Claude Client (src/lib/claude/client.ts)
- [x] Claude Prompts (src/lib/claude/prompts.ts)
- [x] use-article-analysis Hook (src/hooks/use-article-analysis.ts)
- [x] Analysis Header Komponente (mit Breadcrumb)
- [x] Structure Check Komponente
- [x] SEO Check Komponente
- [x] Content Check Komponente
- [x] AI Suggestions Komponente (mit CopyBlock pro Vorschlag)
- [x] Copy Block Komponente (wiederverwendbar)
- [x] Artikel Detail Page (src/app/article/page.tsx)
- [x] Keyword-Kontext-Tabelle aus GSC (src/components/analysis/keyword-table.tsx)
- [x] Prev/Next Artikel-Navigation (src/components/analysis/article-nav.tsx)
- [x] "Als optimiert markieren" Button + Status-Dropdown

## Extras (Co-Founder Ideas)

- [x] CSV Format Auto-Detection (DE/EN Header, Tab/Semicolon)
- [x] Session Persistence via localStorage (Zustand persist)
- [x] Progressive Disclosure bei KI-Analyse
- [x] "Copy Full Brief" Button
- [x] Keyboard Shortcut Cmd+U
- [x] Dark Theme als Standard (Landing Page Design)
- [ ] Dark/Light Mode Toggle

## Phase 2: SERP-Konkurrenzanalyse

- [x] SERP Types (src/types/serp.ts)
- [x] SERP Client abstrahiert (src/lib/serp/client.ts -- ValueSERP, austauschbar)
- [x] SERP Analyzer (src/lib/serp/analyzer.ts -- Titel-Muster, Coverage, Gaps via Claude)
- [x] SERP API Route (src/app/api/serp-analysis/route.ts)
- [x] use-serp-analysis Hook
- [x] SERP Results Panel UI (src/components/serp/serp-results-panel.tsx)
- [x] Integration in Artikel-Detail (SERP-Check Button)
- [x] Test-Daten erstellt (test-data/)
- [x] Flow-Test bestanden (Parser, Scoring, Kategorien)
- [ ] ValueSERP API Key eintragen und live testen

## Phase 2: GSC API Integration

- [x] NextAuth.js v5 Setup (Google OAuth, GSC readonly scope)
- [x] Auth Types + Module Augmentation (src/types/auth.ts)
- [x] GSC API Types (src/types/gsc-api.ts)
- [x] Auth Config mit Token Refresh (src/lib/auth.ts)
- [x] Auth Route Handler (src/app/api/auth/[...nextauth]/route.ts)
- [x] SessionProvider Wrapper (src/components/gsc/session-provider.tsx)
- [x] Layout mit AuthSessionProvider wrappen
- [x] GSC API Client mit Pagination (src/lib/gsc/client.ts)
- [x] GSC Transformer — API Rows → PageData[] (src/lib/gsc/transformer.ts)
- [x] API Route: GSC Sites (src/app/api/gsc/sites/route.ts)
- [x] API Route: GSC Data + Scoring (src/app/api/gsc/data/route.ts)
- [x] Zustand Store: gscConnection State Slice
- [x] use-gsc Hook (src/hooks/use-gsc.ts)
- [x] GSC Connect Button (src/components/gsc/gsc-connect-button.tsx)
- [x] Property Selector mit Datums-Presets (src/components/gsc/property-selector.tsx)
- [x] GSC Status Banner (src/components/gsc/gsc-status-banner.tsx)
- [x] Dashboard Empty State: GSC primary, CSV secondary
- [x] Header: User Avatar, konditionaler Upload-Button
- [x] Google Setup Anleitung (docs/google-setup.md)
- [ ] Google Cloud Console Credentials eintragen und live testen
- [ ] Produktions-Redirect-URI konfigurieren (Vercel)

## Phase 2: Weitere Module

- [x] Content-Briefing-Generator
- [ ] Supabase Integration (Daten persistieren)
- [ ] URL-Clustering / Keyword-Kannibalisierung
