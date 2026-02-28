import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { cache } from "@/lib/cache";
import { sanitizeTextValue } from "@/lib/school-data";

// GET /api/schools/areas — List distinct areas (optionally scoped by emirate)
export async function GET(request: NextRequest) {
  const emirate = request.nextUrl.searchParams.get("emirate");
  const cacheKey = `schools:areas:${emirate || "all"}`;
  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    let sql = `SELECT DISTINCT area, COUNT(*) as count
       FROM schools
       WHERE is_active = true AND area IS NOT NULL AND area != ''`;
    const params: unknown[] = [];

    if (emirate) {
      sql += ` AND emirate = $1`;
      params.push(emirate);
    }

    sql += ` GROUP BY area ORDER BY count DESC, area ASC`;

    const result = await db.query(sql, params);

    const areas = result.rows.flatMap((r: { area: string; count: string }) => {
      const name = sanitizeTextValue(r.area);
      if (!name) return [];
      return [{ name, count: parseInt(r.count) }];
    });

    await cache.set(cacheKey, areas, 3600);
    return NextResponse.json(areas, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Areas list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch areas" },
      { status: 500 }
    );
  }
}
