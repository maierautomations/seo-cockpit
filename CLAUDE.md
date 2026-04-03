# SEO Cockpit

Next.js App (App Router), TypeScript strict, Tailwind CSS, shadcn/ui.
Auth: Supabase Auth (Google OAuth for user accounts) + NextAuth.js v5 (GSC API only). Backend: Supabase (PostgreSQL, connected). KI: Claude API (Sonnet 4.6 / Opus 4.6).

## Tech Stack

- Framework: Next.js 16.2.1 (App Router, Server Components default, React Compiler enabled)
- Styling: Tailwind CSS v4 (inline @theme) + shadcn/ui
- State: Zustand (with localStorage persist)
- Auth (User): Supabase Auth (Google OAuth provider) — login, session, route protection
- Auth (GSC): NextAuth.js v5 (next-auth@beta, GSC readonly scope only)
- Database: Supabase (PostgreSQL, connected — schema deployed, client ready)
- API: Next.js API Routes (serverless)
- AI: Anthropic Claude API (@anthropic-ai/sdk)
- Article Fetch: Firecrawl HTTP API (with direct fetch fallback)
- CSV Parsing: PapaParse (client-side)
- Hosting: Vercel

## Architecture

```
src/
├── app/                    # Pages, layouts, API routes
│   ├── layout.tsx          # Root layout (lang=de, SupabaseAuthProvider, SessionProvider, Toaster)
│   ├── page.tsx            # Root redirect → /landing/index.html
│   ├── login/page.tsx      # Login page (Supabase Auth Google OAuth + demo mode link)
│   ├── dashboard/page.tsx  # Dashboard (DashboardShell, protected route)
│   ├── article/page.tsx    # Article analysis detail view (?url=..., protected)
│   ├── briefing/page.tsx   # Content briefing generator (supports ?id= for saved, protected)
│   ├── briefings/page.tsx  # Saved briefings list (protected)
│   ├── auth/callback/      # Supabase Auth OAuth callback (exchanges code for session)
│   └── api/
│       ├── analyze/        # POST: structure + SEO check + Claude API
│       ├── auth/[...nextauth]/ # NextAuth.js route handler (Google OAuth)
│       ├── briefing/       # POST: SERP fetch + Claude briefing generation
│       ├── fetch-article/  # POST: Firecrawl or direct fetch → markdown
│       ├── gsc/
│       │   ├── sites/      # GET: list user's GSC properties
│       │   └── data/       # POST: fetch search analytics, score, return ScoredPage[]
│       ├── serp-analysis/  # POST: ValueSERP API + Claude gap analysis
│       └── supabase/
│           ├── imports/    # POST: persist CSV import to Supabase
│           ├── pages/      # GET: load pages from most recent import
│           ├── analyses/   # GET: load cached article analysis
│           ├── statuses/   # GET/POST: read/write article statuses
│           └── briefings/  # GET: list/load saved briefings
├── components/
│   ├── ui/                 # shadcn/ui (button, card, badge, table, dialog, etc.)
│   ├── shared/             # header, category-badge, score-bar, status-badge, status-select, breadcrumb
│   ├── dashboard/          # kpi-cards, top-candidates, category-summary, dashboard-shell, filter-bar, article-list, status-overview
│   ├── upload/             # csv-upload-zone, upload-dialog
│   ├── analysis/           # analysis-header, structure-check, seo-check, content-check, ai-suggestions, copy-block, keyword-table, article-nav
│   ├── briefing/           # briefing-input, briefing-progress, briefing-result, heading-structure-card, keyword-cluster-card, elements-card, faq-card, yoast-card, internal-links-card, serp-context-card
│   ├── gsc/                # session-provider, gsc-connect-button, property-selector, gsc-status-banner
│   └── serp/               # serp-results-panel
├── hooks/                  # use-auth, use-csv-upload, use-article-analysis, use-serp-analysis, use-briefing, use-gsc, use-supabase-sync
├── lib/
│   ├── auth.ts             # NextAuth.js config (Google provider, token refresh)
│   ├── store.ts            # Zustand store (CSV data, scored pages, analysis, article statuses, GSC connection)
│   ├── format.ts           # German number formatting
│   ├── filter-pages.ts     # Filter/sort utility for dashboard
│   ├── status-config.ts    # Article status definitions (offen/in-bearbeitung/optimiert/ignoriert)
│   ├── csv/                # parser, validator, merger
│   ├── scoring/            # benchmarks, categories, engine
│   ├── analysis/           # structure-analyzer, seo-analyzer
│   ├── briefing/           # match-keywords, generate-prompt, to-markdown
│   ├── claude/             # client, prompts
│   ├── gsc/                # client (GSC API), transformer (API rows → PageData[])
│   ├── serp/               # client (ValueSERP, abstracted), analyzer
│   └── supabase/           # client.ts (browser), server.ts (service role), mappers.ts, persist-import.ts
└── types/                  # gsc.ts, scoring.ts, analysis.ts, csv.ts, serp.ts, dashboard.ts, briefing.ts, auth.ts, gsc-api.ts, database.ts
```

## Current State (Phase 1 complete, Phase 2 in progress, Phase 3 started)

### Phase 1 Modules (complete)
1. **CSV-Upload & Parser** — Drag & drop, auto-detection (DE/EN headers, semicolon/tab/comma), German number parsing, BOM handling, 5-row preview
2. **Scoring Engine** — Weighted formula (40% impressions, 30% position, 20% CTR deviation, 10% keywords), 4 categories, potential estimation
3. **Dashboard** — KPI cards, Top-10 candidates, category distribution, full article list with filters/sort/pagination, status tracking per article, status overview row
4. **Article Deep Analysis** — Firecrawl + fallback fetch, structure check, SEO check, Claude Sonnet 4.6 for content analysis + suggestions, keyword context table, prev/next navigation, "Als optimiert markieren" button

### Phase 2 Modules (in progress)
5. **SERP-Konkurrenzanalyse** — ValueSERP API (abstracted client), title pattern analysis, topic coverage + gap analysis (Claude), featured snippet detection, "People Also Ask", integrated in article detail view
6. **Content-Briefing-Generator** — /briefing page, keyword input → GSC cluster matching + SERP analysis + Claude briefing, heading structure, recommended elements, FAQ, Yoast SEO fields, internal link suggestions, markdown export
7. **GSC API Integration** — Google OAuth2 (NextAuth.js v5), Search Console API for direct data import, real keyword-to-URL mapping, property selector, date range picker, connected status banner, CSV fallback preserved

### Phase 3 Modules (in progress)
8. **Supabase Database** — Schema deployed (8 tables + migrations). RLS enabled. TypeScript types generated. Dual-mode persistence: logged-in users read/write Supabase, demo/anonymous users use localStorage.
9. **Supabase Auth** — Google OAuth for user accounts. Login page at /login. Route protection via Next.js middleware. Profile auto-created via DB trigger on signup. Demo mode at /dashboard?demo=true (localStorage only, banner shown). NextAuth stripped to GSC-only OAuth. GSC tokens persisted to gsc_connections table.

### Key Features
- Progressive Disclosure: structure/SEO checks instant, AI analysis on button click
- Dual-mode persistence: Supabase for logged-in users, localStorage for anonymous (Zustand persist middleware)
- Article status tracking (offen/in-bearbeitung/optimiert/ignoriert) persisted in Supabase + localStorage
- Article analysis caching: saved to Supabase, loaded from cache on revisit (7-day TTL, re-analyze button)
- Briefing persistence: saved to Supabase, /briefings list page to browse saved briefings
- Filter bar: category, impressions range, position range, status, text search (debounced), sortBy/sortDir
- Full paginated article list (25/page) below Top-10 section
- Clickable category distribution sidebar (filters the list)
- Status overview row with counts (clickable to filter)
- Breadcrumb navigation in article detail
- Prev/Next article navigation through scored list
- Keyword context table from GSC data in article detail
- Copy-to-clipboard for all AI suggestions, "Copy Full Brief" for all-in-one
- Keyboard shortcut Cmd+U for quick CSV upload
- SERP client abstraction layer for easy provider swap
- Content briefing generator with SERP-based heading structure, FAQ, Yoast SEO fields
- Briefing keyword cluster matching from GSC data (client-side, token-based)
- Internal link suggestions from GSC data keyword overlap
- Markdown export for briefings
- Google OAuth2 with automatic token refresh (NextAuth.js v5)
- GSC API import: real keyword-to-URL mapping via dimensions: ["query", "page"]
- Property selector with date range presets (3/6/12 months)
- Connected status banner with refresh/disconnect controls
- CSV upload preserved as fallback data source

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
- Claude model IDs: use `claude-sonnet-4-6` and `claude-opus-4-6` (no date suffix)
- Article fetching: Firecrawl HTTP API → markdown (fallback: direct fetch + regex HTML→markdown)
- SERP fetching: abstracted client in src/lib/serp/client.ts, currently ValueSERP, swappable
- Auth (User): Supabase Auth with Google provider, middleware route protection in src/middleware.ts
- Auth (GSC): NextAuth.js v5, config in src/lib/auth.ts, JWT strategy with auto token refresh, GSC-only scope
- Auth provider: SupabaseAuthProvider in src/components/providers/supabase-auth-provider.tsx, useAuth() hook
- Auth helper: getAuthenticatedUserId() in src/lib/api-auth.ts uses Supabase Auth (not NextAuth)
- Route protection: Next.js middleware redirects unauthenticated users from /dashboard, /briefing(s), /article to /login
- Demo mode: /dashboard?demo=true bypasses auth, data in localStorage only, DemoBanner shown
- Login: /login page with Supabase OAuth + "Ohne Account testen" link
- Landing page: Static HTML at /landing/index.html (served via public/landing/), "Kostenlos starten" → /login
- Profile sync: DB trigger auto-creates profile on Supabase Auth signup (auth_user_id column links to auth.users)
- GSC API: server-only client in src/lib/gsc/client.ts, transformer in src/lib/gsc/transformer.ts
- GSC data flow: OAuth → /api/gsc/sites → /api/gsc/data → transformGscData() → scorePages() → store
- Data sources: GSC API (primary, real keyword mapping) or CSV (fallback, estimated mapping)
- State management: Zustand store with persist middleware, no prop drilling
- GSC connection state: persisted in store (property, dateRange, connectedAt, dataSource)
- Article statuses: persisted in store (keyed by URL), survive CSV re-uploads
- Dashboard filters: ephemeral (useState in DashboardShell), reset on page reload
- Filter/sort logic: pure function in src/lib/filter-pages.ts, used by dashboard shell
- Supabase: Browser client in src/lib/supabase/client.ts, service client in src/lib/supabase/server.ts
- Supabase writes: Always via service role key in API routes (NextAuth session verifies user_id)
- Supabase types: Auto-generated in src/types/database.ts (regenerate via MCP after schema changes)
- Supabase project: seo_cockpit (ID: xbeyuwpudimffqcktcyp, region: eu-west-1)
- Supabase dual-mode: Logged in → read/write Supabase (with localStorage as fast cache). Not logged in → localStorage only.
- Supabase profile: Auto-created via DB trigger on Supabase Auth signup. `auth_user_id` links to `auth.users.id`.
- Supabase user ID helper: `getAuthenticatedUserId()` in src/lib/api-auth.ts, uses Supabase Auth session → profile lookup, returns profile UUID or null
- Supabase persistence: All API routes that modify data (analyze, briefing, gsc/data) auto-persist to Supabase if user is logged in (non-blocking)
- Supabase hydration: `useSupabaseSync()` hook fetches pages + statuses from Supabase on dashboard mount if store is empty
- Supabase mappers: src/lib/supabase/mappers.ts converts between DB columns (English) and app types (German field names)
- Supabase analysis cache: 7-day TTL, "Erneut analysieren" button for fresh analysis
- Supabase batch inserts: Chunked in groups of 500 rows (pages, keywords) to avoid payload limits
- Supabase conflict resolution: Supabase data wins on login. If Supabase empty + localStorage has data → migrate to Supabase.

## Environment Variables (.env.local)

- `ANTHROPIC_API_KEY` — Required for AI analysis
- `FIRECRAWL_API_KEY` — Optional, falls back to direct fetch
- `VALUESERP_API_KEY` — Required for SERP analysis (Phase 2)
- `GOOGLE_CLIENT_ID` — Required for GSC API (Google OAuth)
- `GOOGLE_CLIENT_SECRET` — Required for GSC API (Google OAuth)
- `AUTH_SECRET` — Required for NextAuth.js session encryption
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key (client-side)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only, bypasses RLS)

## Reference Documents

- @PRD.md — Full product requirements
- docs/google-setup.md — Google Cloud Console setup guide for GSC OAuth

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
