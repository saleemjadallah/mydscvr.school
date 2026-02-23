# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

mydscvr.ai — AI-powered Dubai school & nursery finder. One Next.js 16 app serving both frontend pages and backend API routes. Deployed to Cloudflare Workers via `@opennextjs/cloudflare`, with PostgreSQL on Railway.

- **Production URL**: https://mydscvr.ai
- **GitHub repo**: https://github.com/saleemjadallah/mydscvr.school
- **Cloudflare Worker**: `mydscvr-ai` (auto-deploys on push to `main` via Workers Builds)

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build (Next.js)
npm run start      # Run production server (local)
npm run lint       # ESLint
npm run db:seed    # Seed database with initial schools (tsx src/db/seed.ts)
npm run preview    # Build + preview on Cloudflare Workers locally
npm run deploy     # Build + deploy to Cloudflare Workers (manual)
npm run cf-typegen # Generate Cloudflare env types
```

## Architecture

**Single Next.js 16 app (App Router) — no separate backend.**

- `src/app/(main)/` — Frontend pages wrapped in branded layout with header/footer/nav + floating ChatWidget
- `src/app/api/` — Backend API routes (REST endpoints)
- `src/app/error.tsx` — Global error boundary
- `src/app/not-found.tsx` — Root 404 page
- `src/app/robots.ts` — Dynamic robots.txt (blocks `/api/`, `/dashboard`, `/profile`, `/saved`)
- `src/app/sitemap.ts` — Dynamic sitemap
- `src/app/providers.tsx` — React Query provider wrapper
- `src/db/` — PostgreSQL connection pool (`pg`) using raw SQL queries (Drizzle ORM is installed but unused)
- `src/lib/` — Server utilities: Upstash Redis cache, Resend email, Exa.ai web search, vector math, rate limiting, client-side API fetch helpers, animations
- `src/hooks/` — Custom React hooks (e.g. `useSavedSchools` for saved/shortlist state via React Query)
- `src/types/index.ts` — All shared TypeScript interfaces (School, Enquiry, Review, User, SearchIntent, etc.)
- `src/components/` — React components; `ui/` subfolder is shadcn/ui (do not manually edit)
- `src/middleware.ts` — Clerk auth protecting `/saved/*`, `/profile/*`, `/dashboard/*`

### Deployment

Deployed to **Cloudflare Workers** (not Pages) via `@opennextjs/cloudflare`.

- `wrangler.jsonc` — Worker config: name `mydscvr-ai`, routes for `mydscvr.ai` and `www.mydscvr.ai`
- `open-next.config.ts` — OpenNext Cloudflare adapter config
- `.dev.vars` — Server-side secrets for local `wrangler dev`/`preview` (gitignored)
- `NEXT_PUBLIC_*` vars are inlined at **build time** → must be in `.env.local` before deploying
- Server-side vars are read at **runtime** → set via `wrangler secret put` on the Worker
- Auto-deploys via Cloudflare Workers Builds connected to GitHub repo (push to `main`)
- See `DEPLOY.md` for full migration guide and secret setup

### Data flow

1. **Client pages** use React Query to call API routes via helpers in `src/lib/api.ts`
2. **API routes** query PostgreSQL directly with `db.query(sql, params)` from `src/db/index.ts`
3. **Caching** via `src/lib/cache.ts` (Upstash Redis) wraps DB responses with TTL
4. **AI search** (`/api/search`): Claude Haiku extracts intent → OpenAI generates embedding → app-level cosine similarity hybrid search (60% semantic + KHDA rating weight + user preference boosts) → Claude generates explanation → Exa.ai fallback when <3 DB results. Authenticated users get personalized ranking based on their preferred curricula, areas, and budget range.
5. **Enquiries** (`/api/enquiries`): saves lead → sends dual Resend emails (parent confirmation + school notification)
6. **School news/insights** (`/api/schools/[slug]/news`, `/api/schools/[slug]/insights`): Exa.ai neural search → cached in Redis (30 min / 1 hour) → async server component on profile page with Suspense
7. **Saved schools** (`/api/saved-schools`): Clerk-authenticated save/unsave with React Query optimistic updates on client
8. **User profile** (`/api/user`): GET/PUT for user profile + preferences (curricula, areas, budget). Preferences apply soft boosts to search ranking.
9. **User activity** (`/api/user/activity`): Dashboard data — saved count, enquiries with status, recent search history
10. **Rate limiting** (`src/lib/rate-limit.ts`): in-memory sliding-window limiter on AI routes — search (20/min), compare (10/min), chat (30/min)

### Semantic search (no pgvector)

Railway PostgreSQL does **not** have pgvector installed. Embeddings are stored as `FLOAT8[]` in the `school_embeddings` table. Cosine similarity is computed in application code (`src/lib/vectors.ts`). This is fast enough for the current scale (~235+ schools). If migrating to a pgvector-capable host (Supabase, Neon), change the column to `vector(1536)` and use the `<=>` operator in SQL instead.

### AI model usage

- **Claude Haiku** (`claude-haiku-4-5-20251001`): search intent extraction, chat, AI summaries, fee extraction, school discovery, sentiment analysis, feature inference — fast/cheap
- **Claude Sonnet** (`claude-sonnet-4-5-20251022`): school comparisons — higher quality
- **Claude Opus** (`claude-opus-4-6-20250205`): KHDA PDF parsing (pipeline only)
- **OpenAI** (`text-embedding-3-small`): 1536-dim embeddings for semantic search
- **Exa.ai** (`exa-js` web app, `exa-py` pipeline): neural web search for school news, insights, fee discovery, school discovery, and search fallback
- **Firecrawl** (`firecrawl-py` pipeline): JSON extraction for school websites and KHDA detail page fallback
- **Google Places API** (New): location, ratings, reviews, coordinates, photos

### Data pipeline (separate repo)

The data pipeline lives in a **separate git repo** (`pipeline/`) deployed to Railway. It runs as a long-lived Python process with a `schedule` loop.

#### Tool layering & data authority

| Data Need | Primary | Fallback | Authority |
|-----------|---------|----------|-----------|
| KHDA school list (~235) | `requests` + regex | Firecrawl JSON | Authoritative for Dubai schools |
| KHDA detail pages | `requests` + BeautifulSoup | Firecrawl JSON | Authoritative for fees, ratings, identity |
| School discovery (non-Dubai) | Exa neural search | — | Supplement only |
| School website content | Firecrawl JSON extraction | — | Authoritative for description, languages, features |
| Fees | KHDA detail page | Exa + Claude Haiku | KHDA > Exa (KHDA prevents Exa overwrite) |
| Location/coords/reviews | Google Places API | — | Authoritative for geo + Google ratings |
| News/insights | Exa (web app, real-time) | — | Not pipeline (served live from web app) |
| Embeddings | OpenAI text-embedding-3-small | — | Rebuilt incrementally |
| AI summaries + features | Claude Haiku | — | Last resort for description/features |
| Review sentiment | Claude Haiku batch | — | Batch classified |

All DB updates use `COALESCE` — existing good data is never overwritten with NULL. Feature flags are only set to `true`, never overridden back to `false`.

#### Nightly pipeline (02:00 UTC) — 8 steps

1. **KHDA directory sync** (`scrapers/khda_directory.py`) — Fetches the KHDA school directory page, regex-parses ~235 schools from the server-rendered HTML. Upserts into `schools` by slug. Falls back to Firecrawl if regex returns <100 schools.
2. **KHDA detail page scrape** (`scrapers/khda_details.py`) — For schools with a KHDA detail URL stale >7 days: fetches with `requests` + BeautifulSoup to extract website, email, principal, founded year, wellbeing/inclusion ratings, fee tables, inspection report URLs. Falls back to Firecrawl. Inserts per-grade fees into `fee_history` (source `'khda'`) and updates `fee_min`/`fee_max`. 2s delay between requests.
3. **Exa.ai school discovery** (`scrapers/exa_crawler.py`) — Runs 7 neural search queries (new openings, by curriculum, by emirate). Claude Haiku extracts school names from results. Dedups against existing schools by name + slug. Inserts new schools as `is_active=false`.
4. **Deduplication + auto-activation** (`processors/deduplication.py`) — Matches inactive Exa schools against active KHDA schools in 3 passes: exact slug → fuzzy name (SequenceMatcher >= 0.85) → embedding cosine similarity (>= 0.92). Duplicates merged (enrich active, delete inactive). Remaining schools auto-activated if confirmed by Google Places (`google_place_id IS NOT NULL`).
5. **Google Places enrichment** (`scrapers/google_places.py`) — For active schools without `google_place_id`: Text Search → Place Details → inserts reviews. Updates lat/lng, rating, review count, photos, phone, website, address. 0.5s delay.
6. **School website scrape** (`scrapers/school_websites.py`) — For active schools with website but no description: Firecrawl JSON extraction for description, languages, feature flags (SEN, transport, boarding, after-school, sports, pool, arts), admission email. 3s delay.
7. **Embedding generation** (`processors/embeddings.py`) — For active schools without embeddings: builds rich text (name, curriculum, area, rating, fees, phases, languages, features, description, summary, KHDA findings) → OpenAI `text-embedding-3-small` in batches of 100 → stored in `school_embeddings`.
8. **AI summary + feature inference** (`processors/enrichment.py`) — For active schools without `ai_summary`: builds context from all available data → Claude Haiku generates summary, strengths, considerations, fallback description (if still NULL), and inferred feature flags.

#### Weekly pipeline (Sunday 03:00 UTC) — 3 steps

1. **Exa fee updates** — For active schools without KHDA-sourced fees in `fee_history`: Exa neural search for fees → Claude Haiku extracts structured fee data → inserts into `fee_history` (source `'exa'`) → updates `fee_min`/`fee_max`/`fee_structure`. 1s delay.
2. **Review sentiment analysis** (`processors/sentiment.py`) — Batch-classifies reviews where `sentiment IS NULL` as positive/neutral/negative via Claude Haiku in batches of 20.
3. **Google Places re-enrichment** — For schools with Google data stale >30 days: refreshes rating + review count via Place Details (no text search needed, uses existing `google_place_id`). Inserts new reviews. 0.5s delay.

#### Pipeline files

| File | Purpose |
|------|---------|
| `main.py` | Scheduler: runs nightly on startup, then `schedule` loop |
| `scrapers/khda_directory.py` | KHDA directory scraper (regex + Firecrawl fallback) |
| `scrapers/khda_details.py` | KHDA detail page scraper (BS4 + Firecrawl fallback) |
| `scrapers/khda_scraper.py` | KHDA PDF report parser (Claude Opus) |
| `scrapers/google_places.py` | Google Places enrichment + re-enrichment |
| `scrapers/exa_crawler.py` | Exa fee discovery + school discovery + fee_history |
| `scrapers/school_websites.py` | School website scraper (Firecrawl JSON) |
| `processors/embeddings.py` | OpenAI embedding generation (batched) |
| `processors/enrichment.py` | AI summaries + feature inference (Claude Haiku) |
| `processors/deduplication.py` | 3-pass dedup + auto-activation |
| `processors/sentiment.py` | Review sentiment classification (Claude Haiku) |

#### Key DB tables fed by pipeline

- `schools` — Core records (235+ KHDA, plus Exa-discovered). Columns include `founded_year`, `wellbeing_rating`, `inclusion_rating`, `principal_name`, `dsib_quality_indicators` (JSONB), and 7 boolean feature flags.
- `school_embeddings` — FLOAT8[] vectors for semantic search
- `khda_reports` — Inspection year, rating, findings (JSONB), AI summary
- `fee_history` — Per-grade per-year fees with source (`'khda'` or `'exa'`)
- `reviews` — Google reviews with `sentiment` (positive/neutral/negative)

#### Pipeline roadmap / action items

- **ADEK scraper** — Add Abu Dhabi Department of Education and Knowledge directory scraper as an authoritative source for Abu Dhabi private schools (similar to KHDA scraper). Would replace Exa discovery as the primary source for Abu Dhabi schools.
- **MOE scraper** — Add Ministry of Education directory scraper for Sharjah, Ajman, RAK, Fujairah, UAQ private schools. Currently these emirates are only discovered via Exa (no authoritative inspection data).
- **ADEK/MOE detail scrapers** — Equivalent of `khda_details.py` for other emirates' inspection/detail pages once directory scrapers exist.
- **Nursery-specific pipeline** — KHDA also regulates Dubai nurseries separately. Add nursery directory scraper + detail page scraper to bring nurseries to the same data quality as schools.

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/schools` | GET | List schools with filters (type, area, curriculum, rating, fees, SEN), sort, pagination |
| `/api/schools/[slug]` | GET | Single school profile |
| `/api/schools/[slug]/similar` | GET | Top 5 semantically similar schools (cosine similarity) |
| `/api/schools/[slug]/news` | GET | Exa.ai school news (cached) |
| `/api/schools/[slug]/insights` | GET | Exa.ai school insights (cached) |
| `/api/schools/areas` | GET | Distinct areas with counts (Redis-cached 1h) |
| `/api/search` | POST | AI search: intent extraction + embedding + hybrid ranking + AI explanation (rate-limited 20/min) |
| `/api/search/chat` | POST | Conversational AI search, multi-turn (rate-limited 30/min) |
| `/api/compare` | POST | AI school comparison with Claude Sonnet (rate-limited 10/min) |
| `/api/enquiries` | POST | Submit parent enquiry (lead gen + dual email) |
| `/api/enquiries/[id]` | GET | Single enquiry details |
| `/api/saved-schools` | GET/POST | List or save a school (Clerk auth required) |
| `/api/saved-schools/[schoolId]` | DELETE | Unsave a school (Clerk auth required) |
| `/api/stats` | GET | Public homepage stats: school/nursery counts, curriculum breakdown (Redis-cached 1h) |
| `/api/claims` | POST | School profile claim requests |
| `/api/user` | GET/PUT | User profile + preferences (Clerk auth required) |
| `/api/user/activity` | GET | Dashboard activity: saved count, enquiries, searches (Clerk auth required) |
| `/api/admin/stats` | GET | Admin dashboard stats |
| `/api/admin/enquiries` | GET | Admin enquiry list |
| `/api/admin/schools/[id]` | PATCH | Admin school update |

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/(main)/page.tsx` | Homepage with AI search bar, dynamic stats, curriculum breakdown |
| `/(main)/schools/page.tsx` | School listing with filters, sort, pagination, map view, AI search, saved schools |
| `/(main)/schools/[slug]/page.tsx` | School profile (SSR+ISR) with SimilarSchools, ProfileMap, news, insights |
| `/(main)/nurseries/page.tsx` | Nursery-specific listing with saved schools |
| `/(main)/compare/page.tsx` | Side-by-side comparison tool with ReactMarkdown AI output |
| `/(main)/map/page.tsx` | Full-screen Mapbox map |
| `/(main)/saved/page.tsx` | Saved/shortlisted schools (Clerk auth required) |
| `/(main)/dashboard/page.tsx` | Parent dashboard: stats, enquiry tracking, recent searches (Clerk auth required) |
| `/(main)/profile/page.tsx` | Profile & preferences: curricula, areas, budget range (Clerk auth required) |
| `/(main)/not-found.tsx` | 404 within layout (header/footer) |

**Note:** All client pages in `(main)/` use `export const dynamic = "force-dynamic"` to prevent static prerendering issues with Clerk auth.

## Key Components

| Component | Purpose |
|-----------|---------|
| `SchoolCard.tsx` | Reusable school card with heart save/unsave toggle + "Enquire Now" CTA |
| `SimilarSchools.tsx` | React Query component fetching `/api/schools/[slug]/similar`, renders top 5 |
| `ChatWidget.tsx` | Floating AI chat widget (bottom-right FAB), multi-turn via `/api/search/chat` |
| `ProfileMap.tsx` | Mapbox GL single-pin map for school profile location section |
| `MapView.tsx` | Full Mapbox map component for the map page |
| `EnquiryForm.tsx` | react-hook-form enquiry with expandable optional fields, phone validation |
| `AIExplanation.tsx` | Renders AI-generated search explanations |
| `SchoolNews.tsx` | Async server component for school news/insights with Suspense |
| `AnimatedCounter.tsx` | Animated number counter for homepage stats |
| `AnimatedSection.tsx` | Intersection Observer scroll-reveal animation wrapper |

## Key Hooks

| Hook | Purpose |
|------|---------|
| `useSavedSchools()` | React Query hook: `savedIds`, `toggleSave()`, `isSaved()`, `isPending`. Enabled only when signed in. |

## Lib Utilities

| File | Purpose |
|------|---------|
| `api.ts` | Client-side fetch helpers for all API routes (schools, search, user, activity, etc.) |
| `cache.ts` | Upstash Redis get/set with TTL, graceful degradation if unconfigured |
| `email.ts` | Resend email templates (parent confirmation, school notification) |
| `exa.ts` | Exa.ai neural web search client for news, insights, fee discovery |
| `rate-limit.ts` | In-memory sliding-window rate limiter with auto-cleanup |
| `vectors.ts` | Cosine similarity for embedding comparison (no pgvector) |
| `animations.ts` | Framer Motion animation variants for page transitions |
| `utils.ts` | shadcn/ui `cn()` utility |

## Key conventions

- **Brand color**: `#FF6B35` (orange) — used everywhere for buttons, badges, accents
- **Database**: raw SQL with parameterized queries (`$1`, `$2`), not an ORM. Connection pool max 10.
- **Embeddings**: stored as `FLOAT8[]` (not pgvector). Cosine similarity in `src/lib/vectors.ts`.
- **KHDA rating colors**: Outstanding=emerald, Very Good=blue, Good=yellow, Acceptable=orange, Weak=red
- **shadcn/ui**: New York style, Lucide icons. Add components via `npx shadcn@latest add <name>`.
- **Path alias**: `@/*` maps to `./src/*`
- **Forms**: react-hook-form for client forms, react-hot-toast for notifications
- **Markdown rendering**: `react-markdown` for AI-generated content (comparisons, chat messages)
- **Animations**: `framer-motion` for page transitions and scroll reveals
- **Pages in `(main)/`**: use the shared layout with header/footer + ChatWidget. Auth pages go in `(auth)/`.
- **API routes**: return `NextResponse.json()`. Use `cache.get/set` for caching. Admin routes check `auth()` from Clerk.
- **Server components** for school profile page (SSR with ISR revalidation). Client components marked `'use client'`.
- **Saved schools**: client state managed via `useSavedSchools()` hook (React Query). `SchoolCard` accepts `isSaved`/`onToggleSave` props.
- **Rate limiting**: AI routes use in-memory sliding window (`src/lib/rate-limit.ts`). IP extracted from `X-Forwarded-For` or `X-Real-IP`.
- **Phone validation**: enquiry form validates phone numbers with pattern `^[+]?[\d\s()-]{7,20}$`

## Environment variables

See `.env.example`. Critical for local dev:
- `DATABASE_URL` — Railway PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — auth (required for build and runtime)
- `ANTHROPIC_API_KEY` + `OPENAI_API_KEY` — AI search features
- `NEXT_PUBLIC_MAPBOX_TOKEN` — map views (used by ProfileMap and map page)
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — caching (gracefully degrades if missing)
- `EXA_API_KEY` — Exa.ai web search for news/insights (gracefully degrades if missing)
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — transactional emails for enquiries

### Build vs Runtime vars

- `NEXT_PUBLIC_*` — inlined at **build time**, must be in `.env.local` before `npm run deploy`
- All other vars — read at **runtime**, set via `wrangler secret put` on the Worker
- `.dev.vars` — local Cloudflare runtime secrets (used by `npm run preview`)

### Worker secrets (set via `wrangler secret put`)

`DATABASE_URL`, `CLERK_SECRET_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `EXA_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
