# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

mydscvr.ai — AI-powered Dubai school & nursery finder. One Next.js 16 app serving both frontend pages and backend API routes. Deployed to Cloudflare Workers via `@opennextjs/cloudflare`, with PostgreSQL on Railway.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build (Next.js)
npm run start      # Run production server (local)
npm run lint       # ESLint
npm run db:seed    # Seed database with initial schools (tsx src/db/seed.ts)
npm run preview    # Build + preview on Cloudflare Workers locally
npm run deploy     # Build + deploy to Cloudflare Workers
npm run cf-typegen # Generate Cloudflare env types
```

## Architecture

**Single Next.js app (App Router) — no separate backend.**

- `src/app/(main)/` — Frontend pages wrapped in branded layout with header/footer/nav + floating ChatWidget
- `src/app/api/` — Backend API routes (REST endpoints)
- `src/db/` — PostgreSQL connection pool (`pg`) using raw SQL queries (Drizzle ORM is installed but unused)
- `src/lib/` — Server utilities: Upstash Redis cache, Resend email, Exa.ai web search, vector math, client-side API fetch helpers
- `src/hooks/` — Custom React hooks (e.g. `useSavedSchools` for saved/shortlist state via React Query)
- `src/types/index.ts` — All shared TypeScript interfaces (School, Enquiry, Review, User, SearchIntent, etc.)
- `src/components/` — React components; `ui/` subfolder is shadcn/ui (do not manually edit)
- `src/middleware.ts` — Clerk auth protecting `/saved/*`, `/profile/*`, `/dashboard/*`

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

### Semantic search (no pgvector)

Railway PostgreSQL does **not** have pgvector installed. Embeddings are stored as `FLOAT8[]` in the `school_embeddings` table. Cosine similarity is computed in application code (`src/lib/vectors.ts`). This is fast enough for the current scale (~20 schools). If migrating to a pgvector-capable host (Supabase, Neon), change the column to `vector(1536)` and use the `<=>` operator in SQL instead.

### AI model usage

- **Claude Haiku** (`claude-haiku-4-5-20251001`): search intent extraction, chat, AI summaries — fast/cheap
- **Claude Sonnet** (`claude-sonnet-4-5-20251022`): school comparisons — higher quality
- **Claude Opus** (`claude-opus-4-6-20250205`): KHDA PDF parsing (pipeline only)
- **OpenAI** (`text-embedding-3-small`): 1536-dim embeddings for semantic search
- **Exa.ai** (`exa-js`): neural web search for school news, insights, fee discovery, and search fallback (`src/lib/exa.ts`)

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/schools` | GET | List schools with filters (type, area, curriculum, rating, fees, SEN), sort, pagination |
| `/api/schools/[slug]` | GET | Single school profile |
| `/api/schools/[slug]/similar` | GET | Top 5 semantically similar schools (cosine similarity) |
| `/api/schools/[slug]/news` | GET | Exa.ai school news (cached) |
| `/api/schools/[slug]/insights` | GET | Exa.ai school insights (cached) |
| `/api/schools/areas` | GET | Distinct areas with counts (Redis-cached 1h) |
| `/api/search` | POST | AI search: intent extraction + embedding + hybrid ranking + AI explanation |
| `/api/search/chat` | POST | Conversational AI search (multi-turn) |
| `/api/compare` | POST | AI school comparison with Claude Sonnet |
| `/api/enquiries` | POST | Submit parent enquiry (lead gen + dual email) |
| `/api/saved-schools` | GET/POST | List or save a school (Clerk auth required) |
| `/api/saved-schools/[schoolId]` | DELETE | Unsave a school (Clerk auth required) |
| `/api/claims` | POST | School profile claim requests |
| `/api/user` | GET/PUT | User profile + preferences (Clerk auth required) |
| `/api/user/activity` | GET | Dashboard activity: saved count, enquiries, searches (Clerk auth required) |
| `/api/admin/stats` | GET | Admin dashboard stats |
| `/api/admin/enquiries` | GET | Admin enquiry list |
| `/api/admin/schools/[id]` | PATCH | Admin school update |

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/(main)/page.tsx` | Homepage with AI search bar |
| `/(main)/schools/page.tsx` | School listing with filters, sort, pagination, map view, AI search, saved schools |
| `/(main)/schools/[slug]/page.tsx` | School profile (SSR+ISR) with SimilarSchools, ProfileMap, news, insights |
| `/(main)/nurseries/page.tsx` | Nursery-specific listing with saved schools |
| `/(main)/compare/page.tsx` | Side-by-side comparison tool with ReactMarkdown AI output |
| `/(main)/map/page.tsx` | Full-screen Mapbox map |
| `/(main)/saved/page.tsx` | Saved/shortlisted schools (Clerk auth required) |
| `/(main)/dashboard/page.tsx` | Parent dashboard: stats, enquiry tracking, recent searches (Clerk auth required) |
| `/(main)/profile/page.tsx` | Profile & preferences: curricula, areas, budget range (Clerk auth required) |

## Key Components

| Component | Purpose |
|-----------|---------|
| `SchoolCard.tsx` | Reusable school card with heart save/unsave toggle + "Enquire Now" CTA |
| `SimilarSchools.tsx` | React Query component fetching `/api/schools/[slug]/similar`, renders top 5 |
| `ChatWidget.tsx` | Floating AI chat widget (bottom-right FAB), multi-turn via `/api/search/chat` |
| `ProfileMap.tsx` | Mapbox GL single-pin map for school profile location section |
| `EnquiryForm.tsx` | react-hook-form enquiry with expandable optional fields (WhatsApp, nationality, child DOB) |

## Key Hooks

| Hook | Purpose |
|------|---------|
| `useSavedSchools()` | React Query hook: `savedIds`, `toggleSave()`, `isSaved()`, `isPending`. Enabled only when signed in. |

## Key conventions

- **Brand color**: `#FF6B35` (orange) — used everywhere for buttons, badges, accents
- **Database**: raw SQL with parameterized queries (`$1`, `$2`), not an ORM. Connection pool max 10.
- **Embeddings**: stored as `FLOAT8[]` (not pgvector). Cosine similarity in `src/lib/vectors.ts`.
- **KHDA rating colors**: Outstanding=emerald, Very Good=blue, Good=yellow, Acceptable=orange, Weak=red
- **shadcn/ui**: New York style, Lucide icons. Add components via `npx shadcn@latest add <name>`.
- **Path alias**: `@/*` maps to `./src/*`
- **Forms**: react-hook-form for client forms, react-hot-toast for notifications
- **Markdown rendering**: `react-markdown` for AI-generated content (comparisons, chat messages)
- **Pages in `(main)/`**: use the shared layout with header/footer + ChatWidget. Auth pages go in `(auth)/`.
- **API routes**: return `NextResponse.json()`. Use `cache.get/set` for caching. Admin routes check `auth()` from Clerk.
- **Server components** for school profile page (SSR with ISR revalidation). Client components marked `'use client'`.
- **Saved schools**: client state managed via `useSavedSchools()` hook (React Query). `SchoolCard` accepts `isSaved`/`onToggleSave` props.

## Environment variables

See `.env.example`. Critical for local dev:
- `DATABASE_URL` — Railway PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — auth (required for pages to load without errors)
- `ANTHROPIC_API_KEY` + `OPENAI_API_KEY` — AI search features
- `NEXT_PUBLIC_MAPBOX_TOKEN` — map views (used by ProfileMap and map page)
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — caching (gracefully degrades if missing)
- `EXA_API_KEY` — Exa.ai web search for news/insights (gracefully degrades if missing)
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — transactional emails for enquiries
