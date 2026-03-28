# SEO Cockpit

Next.js App (App Router), TypeScript strict, Tailwind CSS, shadcn/ui.
Backend: Supabase (PostgreSQL + Auth, Phase 3). KI: Claude API (Sonnet 4.6 / Opus 4.6).

## Tech Stack

- Framework: Next.js 16.2.1 (App Router, Server Components default, React Compiler enabled)
- Styling: Tailwind CSS v4 (inline @theme) + shadcn/ui
- State: Zustand (with localStorage persist)
- Database: Supabase (not yet connected — Phase 3)
- API: Next.js API Routes (serverless)
- AI: Anthropic Claude API (@anthropic-ai/sdk)
- Article Fetch: Firecrawl HTTP API (with direct fetch fallback)
- CSV Parsing: PapaParse (client-side)
- Hosting: Vercel

## Architecture

```
src/
├── app/                    # Pages, layouts, API routes
│   ├── layout.tsx          # Root layout (lang=de, Toaster, TooltipProvider)
│   ├── page.tsx            # Dashboard (DashboardShell)
│   ├── article/page.tsx    # Article analysis detail view (?url=...)
│   └── api/
│       ├── analyze/        # POST: structure + SEO check + Claude API
│       └── fetch-article/  # POST: Firecrawl or direct fetch → markdown
├── components/
│   ├── ui/                 # shadcn/ui (button, card, badge, table, dialog, etc.)
│   ├── shared/             # header, category-badge, score-bar
│   ├── dashboard/          # kpi-cards, top-candidates, category-summary, dashboard-shell
│   ├── upload/             # csv-upload-zone, upload-dialog
│   └── analysis/           # analysis-header, structure-check, seo-check, content-check, ai-suggestions, copy-block
├── hooks/                  # use-csv-upload, use-article-analysis
├── lib/
│   ├── store.ts            # Zustand store (CSV data, scored pages, analysis)
│   ├── format.ts           # German number formatting
│   ├── csv/                # parser, validator, merger
│   ├── scoring/            # benchmarks, categories, engine
│   ├── analysis/           # structure-analyzer, seo-analyzer
│   └── claude/             # client, prompts
└── types/                  # gsc.ts, scoring.ts, analysis.ts, csv.ts
```

## Current State (Phase 1 MVP)

### Implemented Modules
1. **CSV-Upload & Parser** — Drag & drop, auto-detection (DE/EN headers, semicolon/tab/comma), German number parsing, BOM handling
2. **Scoring Engine** — Weighted formula (40% impressions, 30% position, 20% CTR deviation, 10% keywords), 4 categories, potential estimation
3. **Dashboard** — KPI cards, Top-10 candidates with score bars, category distribution, empty state with upload CTA
4. **Article Deep Analysis** — Firecrawl + fallback fetch, structure check (H1/FAQ/infobox/tables), SEO check (meta/title/alt/links), Claude Sonnet 4.6 for content analysis + suggestions

### Key Features
- Progressive Disclosure: structure/SEO checks instant, AI analysis on button click
- Session persistence via localStorage (Zustand persist middleware)
- Copy-to-clipboard for all AI suggestions, "Copy Full Brief" for all-in-one
- Keyboard shortcut Cmd+U for quick CSV upload

## Rules

- TypeScript strict mode, no `any`
- Server Components by default, 'use client' only when needed
- Named exports, no default exports (except pages)
- All UI components use shadcn/ui as base
- German UI labels, English code/comments
- No hardcoded API keys — use environment variables
- CSV parsing runs client-side, AI calls go through API routes
- Dark theme as default (ink/signal color palette from landing page)

## Commands

- Dev: npm run dev
- Build: npm run build
- Lint: npm run lint
- Install: npm install

## Key Patterns

- GSC CSV format: Suchanfrage/Seite/Klicks/Impressionen/CTR/Position
- Scoring engine is pure logic (no LLM needed)
- Claude API calls always go through /app/api/ to protect keys
- Article fetching: Firecrawl HTTP API → markdown (fallback: direct fetch + regex HTML→markdown)
- State management: Zustand store with persist middleware, no prop drilling

## Environment Variables (.env.local)

- `ANTHROPIC_API_KEY` — Required for AI analysis
- `FIRECRAWL_API_KEY` — Optional, falls back to direct fetch

## Reference Documents

- @PRD.md — Full product requirements

## Do Not Edit

- .env.local
- PRD.md (reference document)

## Framework Guidelines

@AGENTS.md

## Available Skills

- frontend-design — use for all UI component creation (distinctive, production-grade design)
- react-best-practices — follow for React/Next.js performance patterns
- git-commit-helper — use for clean commit messages

## Available MCPs

- Firecrawl — use for article fetching/scraping instead of building custom scrapers
- Perplexity — use for SERP analysis and web research
- Context7 — use for up-to-date library/framework documentation lookups
- Supabase — (coming later) for direct database operations
