import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";
import { cache } from "@/lib/cache";

// GET /api/admin/analytics/clicks — Click analytics
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const days = Math.min(365, Math.max(1, parseInt(request.nextUrl.searchParams.get("days") || "30")));

  try {
    const cacheKey = `admin:analytics:clicks:${days}`;
    const cached = await cache.get<Record<string, unknown>>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [byType, bySchool, dailyTrend, totalStats] = await Promise.all([
      db.query(
        `SELECT click_type, COUNT(*)::int as count
         FROM outbound_clicks
         WHERE created_at > NOW() - INTERVAL '1 day' * $1
         GROUP BY click_type
         ORDER BY count DESC`,
        [days]
      ),

      db.query(
        `SELECT s.name, s.slug, COUNT(*)::int as count
         FROM outbound_clicks o
         JOIN schools s ON s.id = o.school_id
         WHERE o.created_at > NOW() - INTERVAL '1 day' * $1
         GROUP BY s.id, s.name, s.slug
         ORDER BY count DESC
         LIMIT 10`,
        [days]
      ),

      db.query(
        `SELECT DATE(created_at) as date, COUNT(*)::int as count
         FROM outbound_clicks
         WHERE created_at > NOW() - INTERVAL '1 day' * $1
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [days]
      ),

      db.query(
        `SELECT COUNT(*)::int as total,
                COUNT(DISTINCT ip_address)::int as unique_visitors,
                COUNT(DISTINCT school_id)::int as unique_schools
         FROM outbound_clicks
         WHERE created_at > NOW() - INTERVAL '1 day' * $1`,
        [days]
      ),
    ]);

    const result = {
      by_type: byType.rows,
      by_school: bySchool.rows,
      daily_trend: dailyTrend.rows.map((r: Record<string, unknown>) => ({
        date: new Date(r.date as string).toISOString().split("T")[0],
        count: r.count,
      })),
      stats: totalStats.rows[0],
    };

    await cache.set(cacheKey, result, 300);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin click analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch click analytics" },
      { status: 500 }
    );
  }
}
