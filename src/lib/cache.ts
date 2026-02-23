import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!_redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await getRedis()!.get<T>(key);
      return data;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    try {
      await getRedis()!.set(key, value, { ex: ttlSeconds });
    } catch {
      // Cache failures should not break the app
    }
  },

  async del(key: string): Promise<void> {
    try {
      await getRedis()!.del(key);
    } catch {
      // Ignore
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await getRedis()!.keys(pattern);
      if (keys.length > 0) {
        await getRedis()!.del(...keys);
      }
    } catch {
      // Ignore
    }
  },
};
