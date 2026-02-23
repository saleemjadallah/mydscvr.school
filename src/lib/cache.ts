import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get<T>(key);
      return data;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
    } catch {
      // Cache failures should not break the app
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch {
      // Ignore
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // Ignore
    }
  },
};
