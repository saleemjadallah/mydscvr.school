import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { cache } from "@/lib/cache";
import { sanitizeSchoolRecord } from "@/lib/school-data";

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
        json_agg(DISTINCT fh.*) FILTER (WHERE fh.id IS NOT NULL) as fee_history,
        json_agg(DISTINCT jsonb_build_object(
          'id', sp.id, 'school_id', sp.school_id, 'r2_url', sp.r2_url,
          'photo_type', sp.photo_type, 'source', sp.source,
          'width', sp.width, 'height', sp.height,
          'sort_order', sp.sort_order, 'alt_text', sp.alt_text,
          'is_active', sp.is_active
        )) FILTER (WHERE sp.id IS NOT NULL) as photos
      FROM schools s
      LEFT JOIN khda_reports kr ON kr.school_id = s.id
      LEFT JOIN reviews r ON r.school_id = s.id
      LEFT JOIN fee_history fh ON fh.school_id = s.id
      LEFT JOIN school_photos sp ON sp.school_id = s.id AND sp.is_active = true
      WHERE s.slug = $1 AND s.is_active = true
      GROUP BY s.id
    `,
      [slug]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const school = sanitizeSchoolRecord(result.rows[0]);
    await cache.set(cacheKey, school, 600);
    return NextResponse.json(school, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("School fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch school" },
      { status: 500 }
    );
  }
}
