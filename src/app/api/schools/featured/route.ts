import { NextResponse } from "next/server";
import db from "@/db";
import { cache } from "@/lib/cache";

const CACHE_KEY = "homepage:featured";
const CACHE_TTL = 1800; // 30 minutes

export async function GET() {
  const cached = await cache.get<{ schools: unknown[] }>(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  try {
    const result = await db.query(
      `SELECT
         s.id, s.slug, s.name, s.area, s.khda_rating,
         s.google_rating, s.google_review_count,
         s.fee_min, s.fee_max, s.curriculum,
         s.google_photos,
         (SELECT sp.r2_url FROM school_photos sp
          WHERE sp.school_id = s.id AND sp.is_active = true
          ORDER BY sp.sort_order LIMIT 1
         ) AS hero_photo_url
       FROM schools s
       WHERE s.is_active = true AND s.is_featured = true
       ORDER BY
         CASE s.khda_rating
           WHEN 'Outstanding' THEN 1
           WHEN 'Very Good' THEN 2
           WHEN 'Good' THEN 3
           WHEN 'Acceptable' THEN 4
           ELSE 5
         END,
         s.google_rating DESC NULLS LAST
       LIMIT 12`
    );

    const response = { schools: result.rows };
    await cache.set(CACHE_KEY, response, CACHE_TTL);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Featured schools fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured schools" },
      { status: 500 }
    );
  }
}
