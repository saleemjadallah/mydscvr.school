import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";
import { cache } from "@/lib/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { schoolId } = await params;
    const days = Math.min(
      Math.max(parseInt(req.nextUrl.searchParams.get("days") || "30", 10) || 30, 1),
      365
    );

    // Check cache
    const cacheKey = `click-stats:${schoolId}:${days}`;
    const cached = await cache.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevPeriodStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);

    // Run all queries in parallel
    const [
      totalResult,
      uniqueResult,
      byTypeResult,
      byDayResult,
      topQueriesResult,
      enquiryResult,
      prevPeriodResult,
    ] = await Promise.all([
      // Total clicks in period
      db.query(
        `SELECT COUNT(*)::int AS total
         FROM outbound_clicks
         WHERE school_id = $1 AND created_at >= $2`,
        [schoolId, periodStart.toISOString()]
      ),
      // Unique visitors (distinct IP)
      db.query(
        `SELECT COUNT(DISTINCT ip_address)::int AS unique_visitors
         FROM outbound_clicks
         WHERE school_id = $1 AND created_at >= $2 AND ip_address IS NOT NULL`,
        [schoolId, periodStart.toISOString()]
      ),
      // Clicks by type
      db.query(
        `SELECT click_type, COUNT(*)::int AS count
         FROM outbound_clicks
         WHERE school_id = $1 AND created_at >= $2
         GROUP BY click_type
         ORDER BY count DESC`,
        [schoolId, periodStart.toISOString()]
      ),
      // Daily click counts
      db.query(
        `SELECT DATE(created_at) AS date, COUNT(*)::int AS count
         FROM outbound_clicks
         WHERE school_id = $1 AND created_at >= $2
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [schoolId, periodStart.toISOString()]
      ),
      // Top 10 search queries
      db.query(
        `SELECT search_query AS query, COUNT(*)::int AS count
         FROM outbound_clicks
         WHERE school_id = $1 AND created_at >= $2 AND search_query IS NOT NULL AND search_query != ''
         GROUP BY search_query
         ORDER BY count DESC
         LIMIT 10`,
        [schoolId, periodStart.toISOString()]
      ),
      // Enquiry count in period
      db.query(
        `SELECT COUNT(*)::int AS count
         FROM enquiries
         WHERE school_id = $1 AND created_at >= $2`,
        [schoolId, periodStart.toISOString()]
      ),
      // Previous period total (for comparison)
      db.query(
        `SELECT COUNT(*)::int AS total
         FROM outbound_clicks
         WHERE school_id = $1 AND created_at >= $2 AND created_at < $3`,
        [schoolId, prevPeriodStart.toISOString(), periodStart.toISOString()]
      ),
    ]);

    const totalClicks = totalResult.rows[0]?.total ?? 0;
    const prevTotal = prevPeriodResult.rows[0]?.total ?? 0;
    const changePct =
      prevTotal > 0
        ? Math.round(((totalClicks - prevTotal) / prevTotal) * 100)
        : totalClicks > 0
          ? 100
          : 0;

    const result = {
      total_clicks: totalClicks,
      unique_visitors: uniqueResult.rows[0]?.unique_visitors ?? 0,
      enquiry_count: enquiryResult.rows[0]?.count ?? 0,
      by_type: byTypeResult.rows,
      by_day: byDayResult.rows.map((r: { date: string; count: number }) => ({
        date: new Date(r.date).toISOString().split("T")[0],
        count: r.count,
      })),
      top_search_queries: topQueriesResult.rows,
      previous_period: {
        total_clicks: prevTotal,
        change_pct: changePct,
      },
    };

    // Cache for 30 minutes
    await cache.set(cacheKey, result, 1800);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[track/stats] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
