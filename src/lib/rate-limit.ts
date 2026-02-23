/**
 * Simple in-memory sliding-window rate limiter.
 * Works across serverless invocations on the same instance.
 * For multi-instance deployments, swap to Upstash @upstash/ratelimit.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 120_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds until oldest request expires
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.limit) {
    const oldest = entry.timestamps[0];
    const resetIn = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    };
  }

  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: config.limit - entry.timestamps.length,
    resetIn: config.windowSeconds,
  };
}

/**
 * Extract a rate-limit key from the request.
 * Uses X-Forwarded-For (Vercel), then falls back to a generic key.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "anonymous";
}
