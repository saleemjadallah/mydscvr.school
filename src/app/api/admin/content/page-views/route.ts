import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";
import { cache } from "@/lib/cache";

// GET /api/admin/content/page-views — Page view analytics
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const days = Math.min(365, Math.max(1, parseInt(request.nextUrl.searchParams.get("days") || "30")));

  try {
    const cacheKey = `admin:content:page-views:${days}`;
    const cached = await cache.get<Record<string, unknown>>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [overTime, topPages, topSchoolProfiles, deviceBreakdown, referrerSources, utmCampaigns] = await Promise.all([
      // Page views over time
      db.query(
        `SELECT DATE(created_at) as date, COUNT(*)::int as count
         FROM page_views
         WHERE created_at > NOW() - INTERVAL '1 day' * $1
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [days]
      ),

      // Top 20 pages
      db.query(
        `SELECT path, page_type, COUNT(*)::int as count
         FROM page_views
         WHERE created_at > NOW() - INTERVAL '1 day' * $1
         GROUP BY path, page_type
         ORDER BY count DESC
         LIMIT 20`,
        [days]
      ),

      // Top school profiles by views
      db.query(
        `SELECT s.name, s.slug, COUNT(*)::int as views
         FROM page_views pv
         JOIN schools s ON s.id = pv.school_id
         WHERE pv.page_type = 'school_profile' AND pv.created_at > NOW() - INTERVAL '1 day' * $1
         GROUP BY s.id, s.name, s.slug
         ORDER BY views DESC
         LIMIT 20`,
        [days]
      ),

      // Device breakdown
      db.query(
        `SELECT COALESCE(device_type, 'unknown') as device, COUNT(*)::int as count
         FROM page_views
         WHERE created_at > NOW() - INTERVAL '1 day' * $1
         GROUP BY device_type
         ORDER BY count DESC`,
        [days]
      ),

      // Referrer sources
      db.query(
        `SELECT
           CASE
             WHEN referrer IS NULL OR referrer = '' THEN 'direct'
             WHEN referrer ILIKE '%google%' THEN 'google'
             WHEN referrer ILIKE '%facebook%' OR referrer ILIKE '%fb.%' THEN 'facebook'
             WHEN referrer ILIKE '%instagram%' THEN 'instagram'
             WHEN referrer ILIKE '%twitter%' OR referrer ILIKE '%x.com%' THEN 'twitter/x'
             WHEN referrer ILIKE '%linkedin%' THEN 'linkedin'
             ELSE 'other'
           END as source,
           COUNT(*)::int as count
         FROM page_views
         WHERE created_at > NOW() - INTERVAL '1 day' * $1
         GROUP BY source
         ORDER BY count DESC`,
        [days]
      ),

      // UTM campaigns
      db.query(
        `SELECT utm_source, utm_medium, utm_campaign, COUNT(*)::int as count
         FROM page_views
         WHERE created_at > NOW() - INTERVAL '1 day' * $1
           AND utm_source IS NOT NULL
         GROUP BY utm_source, utm_medium, utm_campaign
         ORDER BY count DESC
         LIMIT 20`,
        [days]
      ),
    ]);

    const result = {
      over_time: overTime.rows.map((r: Record<string, unknown>) => ({
        date: new Date(r.date as string).toISOString().split("T")[0],
        count: r.count,
      })),
      top_pages: topPages.rows,
      top_school_profiles: topSchoolProfiles.rows,
      device_breakdown: deviceBreakdown.rows,
      referrer_sources: referrerSources.rows,
      utm_campaigns: utmCampaigns.rows,
    };

    await cache.set(cacheKey, result, 300);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin page views error:", error);
    return NextResponse.json(
      { error: "Failed to fetch page view data" },
      { status: 500 }
    );
  }
}
