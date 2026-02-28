import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { cache } from "@/lib/cache";

// GET /api/stats — Public homepage stats (cached 1 hour)
// Optional ?emirate=dubai|abu_dhabi for per-emirate counts
export async function GET(request: NextRequest) {
  const emirate = request.nextUrl.searchParams.get("emirate");
  const cacheKey = `homepage:stats:${emirate || "all"}`;
  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // Validate emirate to prevent injection (only allow known values)
    const validEmirate = emirate === "dubai" || emirate === "abu_dhabi" ? emirate : null;

    const countSql = validEmirate
      ? `SELECT
           COUNT(*) FILTER (WHERE type = 'school') as schools,
           COUNT(*) FILTER (WHERE type = 'nursery') as nurseries
         FROM schools
         WHERE is_active = true AND emirate = $1`
      : `SELECT
           COUNT(*) FILTER (WHERE type = 'school') as schools,
           COUNT(*) FILTER (WHERE type = 'nursery') as nurseries
         FROM schools
         WHERE is_active = true`;

    const currSql = validEmirate
      ? `SELECT name, COUNT(*) as count
         FROM (
           SELECT unnest(curriculum) AS name
           FROM schools
           WHERE is_active = true AND emirate = $1
         ) c
         GROUP BY name
         ORDER BY count DESC
         LIMIT 10`
      : `SELECT name, COUNT(*) as count
         FROM (
           SELECT unnest(curriculum) AS name
           FROM schools
           WHERE is_active = true
         ) c
         GROUP BY name
         ORDER BY count DESC
         LIMIT 10`;

    const params = validEmirate ? [validEmirate] : [];

    const [counts, curricula] = await Promise.all([
      db.query(countSql, params),
      db.query(currSql, params),
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
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
