import { NextResponse } from "next/server";
import db from "@/db";
import { cache } from "@/lib/cache";

// GET /api/stats — Public homepage stats (cached 1 hour)
export async function GET() {
  const cacheKey = "homepage:stats";
  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const [counts, curricula] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE type = 'school') as schools,
          COUNT(*) FILTER (WHERE type = 'nursery') as nurseries
        FROM schools
        WHERE is_active = true
      `),
      db.query(`
        SELECT name, COUNT(*) as count
        FROM (
          SELECT unnest(curriculum) AS name
          FROM schools
          WHERE is_active = true
        ) c
        GROUP BY name
        ORDER BY count DESC
        LIMIT 10
      `),
    ]);

    const stats = {
      schools: parseInt(counts.rows[0].schools),
      nurseries: parseInt(counts.rows[0].nurseries),
      curricula: curricula.rows.map((r: { name: string; count: string }) => ({
        name: r.name,
        count: parseInt(r.count),
      })),
    };

    await cache.set(cacheKey, stats, 3600);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
