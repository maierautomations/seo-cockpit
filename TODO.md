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
- [ ] CSV Preview Komponente (optionale Vorschau vor Analyse)

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

## Modul 4: Artikel-Tiefenanalyse
- [x] Fetch Article API Route (src/app/api/fetch-article/route.ts)
- [x] Analyze API Route (src/app/api/analyze/route.ts)
- [x] Structure Analyzer (src/lib/analysis/structure-analyzer.ts)
- [x] SEO Analyzer (src/lib/analysis/seo-analyzer.ts)
- [x] Claude Client (src/lib/claude/client.ts)
- [x] Claude Prompts (src/lib/claude/prompts.ts)
- [x] use-article-analysis Hook (src/hooks/use-article-analysis.ts)
- [x] Analysis Header Komponente
- [x] Structure Check Komponente
- [x] SEO Check Komponente
- [x] Content Check Komponente
- [x] AI Suggestions Komponente
- [x] Copy Block Komponente (wiederverwendbar)
- [x] Artikel Detail Page (src/app/article/page.tsx)

## Extras (Co-Founder Ideas)
- [x] CSV Format Auto-Detection (DE/EN Header, Tab/Semicolon)
- [x] Session Persistence via localStorage (Zustand persist)
- [x] Progressive Disclosure bei KI-Analyse
- [x] "Copy Full Brief" Button
- [x] Keyboard Shortcut Cmd+U
- [x] Dark Theme als Standard (Landing Page Design)
- [ ] Dark/Light Mode Toggle

## Phase 2 (Nächste Schritte)
- [ ] SERP-Konkurrenzanalyse (Perplexity MCP)
- [ ] Content-Briefing-Generator
- [ ] CSV Preview mit Datenvorschau
- [ ] Supabase Integration (Daten persistieren)
- [ ] URL-Clustering / Keyword-Kannibalisierung
