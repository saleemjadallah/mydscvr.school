import { NextResponse } from "next/server";
import db from "@/db";
import { cache } from "@/lib/cache";
import { sanitizeTextValue } from "@/lib/school-data";

// GET /api/schools/areas — List distinct areas
export async function GET() {
  const cacheKey = "schools:areas";
  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const result = await db.query(
      `SELECT DISTINCT area, COUNT(*) as count
       FROM schools
       WHERE is_active = true AND area IS NOT NULL AND area != ''
       GROUP BY area
       ORDER BY count DESC, area ASC`
    );

    const areas = result.rows.flatMap((r: { area: string; count: string }) => {
      const name = sanitizeTextValue(r.area);
      if (!name) return [];
      return [{ name, count: parseInt(r.count) }];
    });

    await cache.set(cacheKey, areas, 3600);
    return NextResponse.json(areas);
  } catch (error) {
    console.error("Areas list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch areas" },
      { status: 500 }
    );
  }
}
