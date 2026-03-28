# SEO Cockpit

Next.js App (App Router), TypeScript strict, Tailwind CSS, shadcn/ui.
Backend: Supabase (PostgreSQL + Auth). KI: Claude API (Sonnet 4.6 / Opus 4.6).

## Tech Stack

- Framework: Next.js (App Router, Server Components default)
- Styling: Tailwind CSS + shadcn/ui
- Database: Supabase
- API: Next.js API Routes (serverless)
- AI: Anthropic Claude API
- Hosting: Vercel

## Architecture

- /app — pages, layouts, API routes
- /app/api — serverless API endpoints (Claude API proxy, CSV parsing)
- /components/ui — shadcn/ui base components
- /components — app-specific components (Dashboard, ArticleAnalysis, etc.)
- /lib — utilities, Claude API client, CSV parser, scoring engine
- /lib/prompts — system prompts for article analysis, SERP analysis
- /types — TypeScript type definitions

## Rules

- TypeScript strict mode, no `any`
- Server Components by default, 'use client' only when needed
- Named exports, no default exports (except pages)
- All UI components use shadcn/ui as base
- German UI labels, English code/comments
- No hardcoded API keys — use environment variables
- CSV parsing runs client-side, AI calls go through API routes

## Commands

- Dev: npm run dev
- Build: npm run build
- Lint: npm run lint
- Install: npm install

## Key Patterns

- GSC CSV format: Suchanfrage/Seite/Klicks/Impressionen/CTR/Position
- Scoring engine is pure logic (no LLM needed)
- Claude API calls always go through /app/api/ to protect keys
- Article fetching: server-side fetch + cheerio for HTML→text

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
