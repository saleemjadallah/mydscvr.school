import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";
import { cache } from "@/lib/cache";

// GET /api/admin/analytics/funnel — Conversion funnel data
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const days = Math.min(365, Math.max(1, parseInt(request.nextUrl.searchParams.get("days") || "30")));

  try {
    const cacheKey = `admin:analytics:funnel:${days}`;
    const cached = await cache.get<Record<string, unknown>>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [pageViews, schoolViews, clicks, enquiries, enrolled] = await Promise.all([
      db.query(
        `SELECT COUNT(*)::int as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * $1`,
        [days]
      ).catch(() => ({ rows: [{ count: 0 }] })),

      db.query(
        `SELECT COUNT(*)::int as count FROM page_views
         WHERE page_type = 'school_profile' AND created_at > NOW() - INTERVAL '1 day' * $1`,
        [days]
      ).catch(() => ({ rows: [{ count: 0 }] })),

      db.query(
        `SELECT COUNT(*)::int as count FROM outbound_clicks WHERE created_at > NOW() - INTERVAL '1 day' * $1`,
        [days]
      ),

      db.query(
        `SELECT COUNT(*)::int as count FROM enquiries WHERE created_at > NOW() - INTERVAL '1 day' * $1`,
        [days]
      ),

      db.query(
        `SELECT COUNT(*)::int as count FROM enquiries
         WHERE status = 'enrolled' AND created_at > NOW() - INTERVAL '1 day' * $1`,
        [days]
      ),
    ]);

    const result = {
      funnel: [
        { stage: "Page Views", count: pageViews.rows[0].count },
        { stage: "School Views", count: schoolViews.rows[0].count },
        { stage: "Clicks", count: clicks.rows[0].count },
        { stage: "Enquiries", count: enquiries.rows[0].count },
        { stage: "Enrolled", count: enrolled.rows[0].count },
      ],
    };

    await cache.set(cacheKey, result, 300);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin funnel error:", error);
    return NextResponse.json(
      { error: "Failed to fetch funnel data" },
      { status: 500 }
    );
  }
}
