# SEO Cockpit

**Data-driven SEO workflow for editorial teams** — prioritize underperforming pages from Google Search Console, analyze article structure and content with AI-assisted diagnostics, and plan new pieces with SERP-aware briefings. Built for high-stakes **YMYL** contexts (e.g. finance), where freshness, accuracy, and E-E-A-T signals matter as much as rankings.

> **Core idea:** Spend effort on *existing* URLs with real impression potential first; use AI as a co-pilot while editors stay in control.

---

## Table of contents

- [Why this exists](#why-this-exists)
- [What you can do today](#what-you-can-do-today)
- [Tech stack](#tech-stack)
- [Architecture (high level)](#architecture-high-level)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project layout](#project-layout)
- [Documentation](#documentation)
- [Roadmap & current status](#roadmap--current-status)
- [Deployment](#deployment)

---

## Why this exists

Editorial SEO often stalls in spreadsheets: export GSC, filter in Excel, open articles one by one, and repeat the same diagnosis work without a shared workflow or history.

**SEO Cockpit** closes the loop:

1. **Ingest** Search Console data (CSV upload or live API after Google sign-in).
2. **Score & prioritize** URLs with a transparent, weighted model (impressions, position, CTR gap, keyword breadth).
3. **Deep-dive** single articles: fetch content, run structure/SEO checks, then optional **Claude** analysis and suggestions.
4. **Compete & plan**: SERP snapshot + gap analysis; **content briefings** with headings, FAQs, Yoast-style fields, and internal link ideas grounded in your GSC clusters.
5. **Persist** (when signed in): Supabase stores imports, pages, keywords, analyses (with cache TTL), statuses, and saved briefings — with **localStorage** as a fast path and anonymous fallback.

The product is **not** a keyword-research suite, backlink tool, or CMS; it optimizes and plans *around* URLs you already have in GSC.

---

## What you can do today

| Area | Capability |
|------|------------|
| **Data import** | GSC CSV (DE/EN headers, flexible delimiters) or **Google OAuth** + Search Console API import with property and date range selection |
| **Dashboard** | KPIs, top candidates, category distribution, full list with filters/sort/pagination, per-URL **status** (e.g. open / in progress / optimized / ignored) |
| **Article analysis** | Firecrawl or direct fetch → markdown; structure + SEO checks; on-demand **Claude** content review; keyword context from GSC; prev/next navigation |
| **SERP** | Provider-abstracted client (ValueSERP); patterns, gaps, PAA/snippet-style signals in the article view |
| **Briefings** | `/briefing` generator with SERP + GSC cluster matching; markdown export; **`/briefings`** list for saved briefings |
| **Persistence** | Logged-in: Supabase (RLS). Anonymous: Zustand + localStorage. Hydration and migration paths documented in contributor notes |

UI copy is **German**; code and internal docs are **English**.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js** 16 (App Router), **React** 19, **TypeScript** strict |
| Styling | **Tailwind CSS** v4, **shadcn/ui**, dark-first palette |
| Auth | **NextAuth.js** v5 — Google OAuth with GSC readonly scope |
| Database | **Supabase** (PostgreSQL), service-role writes from API routes |
| AI | **Anthropic Claude** via server-side API routes (`claude-sonnet-4-6` / `claude-opus-4-6` model IDs in app config) |
| SERP | Abstracted client; **ValueSERP** implementation |
| Article fetch | **Firecrawl** HTTP API with direct-fetch fallback |
| Client CSV | **Papa Parse** |
| State | **Zustand** with persistence |

---

## Architecture (high level)

```text
Browser (dashboard, article, briefing)
    → Next.js API routes (auth, GSC, analyze, fetch-article, SERP, briefing, Supabase proxies)
    → External: Google GSC API, Anthropic, Firecrawl, ValueSERP, Supabase Postgres
```

- **Server Components by default**; `'use client'` only where needed.
- **No API keys in the client** — secrets stay on the server.
- **Dual-mode data**: authenticated users sync to Supabase; others stay local until they sign in.

For a full file-level map (routes, `src/lib/*`, hooks, types), see [`CLAUDE.md`](./CLAUDE.md) in the repository root.

---

## Getting started

### Prerequisites

- **Node.js** 20+ (matches `@types/node` in the project)
- **npm** (or compatible package manager)

### Install

```bash
git clone <your-repo-url> seo-cockpit
cd seo-cockpit
npm install
```

### Configure environment

Create `.env.local` in the project root (see [Environment variables](#environment-variables)); do not commit secrets.

**Google Search Console API:** follow the step-by-step guide in [`docs/google-setup.md`](./docs/google-setup.md) (Cloud project, Search Console API, OAuth client, readonly scope).

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Quality checks

```bash
npm run lint
npm run build
```

---

## Environment variables

Create `.env.local` (never commit secrets). Typical keys:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API — article analysis & briefings |
| `FIRECRAWL_API_KEY` | Optional; improves article extraction |
| `VALUESERP_API_KEY` | SERP features |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | NextAuth Google + GSC |
| `AUTH_SECRET` | NextAuth session encryption |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — API routes that persist data |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

---

## Project layout

```text
src/
├── app/                 # App Router pages, layouts, API routes
├── components/          # UI (shadcn), dashboard, analysis, briefing, GSC, SERP, shared
├── hooks/               # Client hooks (upload, analysis, GSC, Supabase sync, …)
├── lib/                 # Auth, store, scoring, GSC/SERP/Claude/Supabase clients, briefing logic
└── types/               # TypeScript models and generated DB types
```

---

## Documentation

| Document | Contents |
|----------|----------|
| [`PRD.md`](./PRD.md) | Product vision, phased requirements, YMYL/editorial focus (reference; not edited in normal dev) |
| [`docs/google-setup.md`](./docs/google-setup.md) | Google Cloud + OAuth + GSC API setup |
| [`CLAUDE.md`](./CLAUDE.md) | Deep-dive architecture, conventions, Supabase behavior, env var list |

---

## Roadmap & current status

Aligned with the PRD phasing:

- **Phase 1 — Nachoptimierungs-Cockpit:** CSV import, scoring engine, dashboard, article deep analysis with AI — **done**.
- **Phase 2 — SERP & briefings:** ValueSERP integration, SERP panel, briefing generator with export — **in progress / largely shipped**.
- **Phase 3 — Supabase & accounts:** Schema, RLS, persistence for imports, pages, analyses, statuses, briefings; dashboard hydration — **in progress** (e.g. GSC token persistence in `gsc_connections`, auth hardening — see `CLAUDE.md`).

Treat `CLAUDE.md` as the source of truth for the **latest** implementation notes.

---

## Deployment

The app is designed for **[Vercel](https://vercel.com/)** (serverless API routes, env vars in project settings). Ensure all production secrets are set in the host dashboard and that Google OAuth redirect URIs match your deployment URL.

---

## Contributing

This repository is currently **private**. If you extend it, keep **TypeScript strict**, prefer **named exports** (except route `page.tsx`), follow existing **shadcn/ui** patterns, and route all AI and paid third-party calls through **`src/app/api/*`**.

---

*README reflects the product as of April 2026; for implementation detail, prefer `CLAUDE.md` and the codebase.*
