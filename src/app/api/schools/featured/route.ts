import { NextResponse } from "next/server";
import db from "@/db";
import { cache } from "@/lib/cache";
import { isSchoolFeaturedToday } from "@/lib/featured";

const CACHE_KEY = "homepage:featured";
const CACHE_TTL = 1800; // 30 minutes

export async function GET() {
  const cached = await cache.get<{ schools: unknown[] }>(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  try {
    // Fetch schools that are either:
    // 1. Manually featured (is_featured = true, backward compat)
    // 2. On Growth+ subscription plans
    const result = await db.query(
      `SELECT
         s.id, s.slug, s.name, s.area, s.khda_rating,
         s.google_rating, s.google_review_count,
         s.fee_min, s.fee_max, s.curriculum,
         s.google_photos, s.is_featured,
         ss.plan AS subscription_plan,
         (SELECT sp.r2_url FROM school_photos sp
          WHERE sp.school_id = s.id AND sp.is_active = true
          ORDER BY sp.sort_order LIMIT 1
         ) AS hero_photo_url
       FROM schools s
       LEFT JOIN school_subscriptions ss
         ON ss.school_id = s.id AND ss.status IN ('active', 'trialing')
       WHERE s.is_active = true
         AND (s.is_featured = true OR ss.plan IN ('growth', 'elite', 'enterprise'))
       ORDER BY
         CASE s.khda_rating
           WHEN 'Outstanding' THEN 1
           WHEN 'Very Good' THEN 2
           WHEN 'Good' THEN 3
           WHEN 'Acceptable' THEN 4
           ELSE 5
         END,
         s.google_rating DESC NULLS LAST`
    );

    // Filter by today's featured schedule
    const today = new Date();
    const schools = result.rows.filter((row: Record<string, unknown>) => {
      // Manually featured schools always show
      if (row.is_featured) return true;
      // Subscription-based: check deterministic schedule
      const plan = row.subscription_plan as string;
      if (plan) return isSchoolFeaturedToday(row.id as string, plan, today);
      return false;
    }).slice(0, 12);

    const response = { schools };
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
