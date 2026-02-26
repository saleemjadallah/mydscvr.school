import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";
import { cache } from "@/lib/cache";

// GET /api/admin/analytics/search — Search analytics
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const days = Math.min(365, Math.max(1, parseInt(request.nextUrl.searchParams.get("days") || "30")));

  try {
    const cacheKey = `admin:analytics:search:${days}`;
    const cached = await cache.get<Record<string, unknown>>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [topQueries, zeroResults, searchesOverTime, intentBreakdown] = await Promise.all([
      // Top 20 queries
      db.query(
        `SELECT query, COUNT(*)::int as count, AVG(results_count)::int as avg_results
         FROM search_logs
         WHERE created_at > NOW() - INTERVAL '1 day' * $1
         GROUP BY query
         ORDER BY count DESC
         LIMIT 20`,
        [days]
      ),

      // Zero-result queries
      db.query(
        `SELECT query, COUNT(*)::int as count
         FROM search_logs
         WHERE created_at > NOW() - INTERVAL '1 day' * $1 AND results_count = 0
         GROUP BY query
         ORDER BY count DESC
         LIMIT 20`,
        [days]
      ),

      // Searches over time
      db.query(
        `SELECT DATE(created_at) as date, COUNT(*)::int as count
         FROM search_logs
         WHERE created_at > NOW() - INTERVAL '1 day' * $1
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [days]
      ),

      // Intent breakdown from structured_intent
      db.query(
        `SELECT
           COALESCE(
             (structured_intent->>'type')::text,
             (filters->>'type')::text,
             'unknown'
           ) as intent_type,
           COUNT(*)::int as count
         FROM search_logs
         WHERE created_at > NOW() - INTERVAL '1 day' * $1
         GROUP BY intent_type
         ORDER BY count DESC`,
        [days]
      ),
    ]);

    const result = {
      top_queries: topQueries.rows,
      zero_result_queries: zeroResults.rows,
      searches_over_time: searchesOverTime.rows.map((r: Record<string, unknown>) => ({
        date: new Date(r.date as string).toISOString().split("T")[0],
        count: r.count,
      })),
      intent_breakdown: intentBreakdown.rows,
    };

    await cache.set(cacheKey, result, 300);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin search analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch search analytics" },
      { status: 500 }
    );
  }
}
