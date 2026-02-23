# Deploying mydscvr.ai to Cloudflare Workers

## Prerequisites

Fill in ALL missing values in `.env.local` before building:

```env
# Required — get from https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Required — get from https://account.mapbox.com/access-tokens/
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# Optional but recommended — get from https://console.upstash.com
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

Also copy the same server-side values into `.dev.vars` (used by wrangler).

## One-time migration from Pages to Workers

### 1. Remove mydscvr.ai from the old Pages project

Go to Cloudflare Dashboard:
  → Pages → `mydscvr` → Custom domains → Remove `mydscvr.ai`

Or via CLI:
```bash
# Delete the old Pages project entirely (removes all deployments + domain binding)
npx wrangler pages project delete mydscvr
```

### 2. Deploy the Worker

```bash
npm run deploy
```

This runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy`, which:
- Builds your Next.js app
- Transforms it for Cloudflare Workers
- Deploys to your account as `mydscvr-ai` worker
- Binds `mydscvr.ai` and `www.mydscvr.ai` routes (configured in wrangler.jsonc)

### 3. Set secrets on the Worker

Server-side secrets are NOT baked into the build. Set them on the deployed Worker:

```bash
echo "YOUR_VALUE" | npx wrangler secret put DATABASE_URL
echo "YOUR_VALUE" | npx wrangler secret put CLERK_SECRET_KEY
echo "YOUR_VALUE" | npx wrangler secret put ANTHROPIC_API_KEY
echo "YOUR_VALUE" | npx wrangler secret put OPENAI_API_KEY
echo "YOUR_VALUE" | npx wrangler secret put EXA_API_KEY
echo "YOUR_VALUE" | npx wrangler secret put RESEND_API_KEY
echo "YOUR_VALUE" | npx wrangler secret put RESEND_FROM_EMAIL
echo "YOUR_VALUE" | npx wrangler secret put UPSTASH_REDIS_REST_URL
echo "YOUR_VALUE" | npx wrangler secret put UPSTASH_REDIS_REST_TOKEN
```

### 4. Verify

Visit https://mydscvr.ai — should show the new site.

## Ongoing deployments

After the initial setup, just run:

```bash
npm run deploy
```

Or connect your GitHub repo to Cloudflare Workers Builds for automatic deploys on push.

## Local preview (Cloudflare runtime)

```bash
npm run preview
```

This builds and runs locally on the Workers runtime (uses `.dev.vars` for secrets).

## Environment variable notes

- `NEXT_PUBLIC_*` vars are inlined at **build time** → must be in `.env.local` before `npm run deploy`
- Server-side vars are read at **runtime** → set via `wrangler secret put` on the Worker
- `.dev.vars` is used by `wrangler dev`/`preview` for local Cloudflare testing
