import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { cache } from "@/lib/cache";

// GET /api/schools/:slug — Single school profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cacheKey = `school:${slug}`;
  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const result = await db.query(
      `
      SELECT
        s.*,
        json_agg(DISTINCT kr.*) FILTER (WHERE kr.id IS NOT NULL) as khda_reports,
        json_agg(DISTINCT r.*) FILTER (WHERE r.id IS NOT NULL) as reviews,
        json_agg(DISTINCT fh.*) FILTER (WHERE fh.id IS NOT NULL) as fee_history
      FROM schools s
      LEFT JOIN khda_reports kr ON kr.school_id = s.id
      LEFT JOIN reviews r ON r.school_id = s.id
      LEFT JOIN fee_history fh ON fh.school_id = s.id
      WHERE s.slug = $1 AND s.is_active = true
      GROUP BY s.id
    `,
      [slug]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    await cache.set(cacheKey, result.rows[0], 600);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("School fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch school" },
      { status: 500 }
    );
  }
}
