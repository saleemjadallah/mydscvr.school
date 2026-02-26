import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";
import { cache } from "@/lib/cache";

// GET /api/admin/dashboard — All dashboard KPIs + charts
export async function GET() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  try {
    // Cache for 5 minutes
    const cacheKey = "admin:dashboard";
    const cached = await cache.get<Record<string, unknown>>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [
      schoolStats,
      userStats,
      enquiryStats,
      searchStats,
      pageViewStats,
      clickStats,
      enquiriesOverTime,
      topSchoolsByEnquiries,
      enquirySourceBreakdown,
      recentEnquiries,
      pendingClaims,
      pipelineHealth,
    ] = await Promise.all([
      // Schools KPIs
      db.query(`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE is_active)::int as active,
          COUNT(*) FILTER (WHERE is_verified)::int as verified,
          COUNT(*) FILTER (WHERE fee_min IS NOT NULL OR fee_max IS NOT NULL)::int as with_fees,
          CASE WHEN COUNT(*) > 0
            THEN ROUND(COUNT(*) FILTER (WHERE is_verified)::numeric / COUNT(*)::numeric * 100)::int
            ELSE 0
          END as verified_pct,
          CASE WHEN COUNT(*) > 0
            THEN ROUND(COUNT(*) FILTER (WHERE fee_min IS NOT NULL)::numeric / COUNT(*)::numeric * 100)::int
            ELSE 0
          END as fees_pct
        FROM schools
      `),

      // Users KPIs
      db.query(`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int as new_this_week
        FROM users
      `),

      // Enquiry KPIs
      db.query(`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int as this_week,
          COUNT(*) FILTER (WHERE status = 'new' OR status = 'sent_to_school')::int as pending,
          COUNT(*) FILTER (WHERE status = 'responded' OR status = 'enrolled')::int as responded
        FROM enquiries
      `),

      // Searches this week
      db.query(
        `SELECT COUNT(*)::int as total FROM search_logs WHERE created_at > NOW() - INTERVAL '7 days'`
      ),

      // Page views this week
      db.query(`
        SELECT COUNT(*)::int as total
        FROM page_views
        WHERE created_at > NOW() - INTERVAL '7 days'
      `).catch(() => ({ rows: [{ total: 0 }] })),

      // Outbound clicks this week
      db.query(`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE click_type = 'website')::int as website,
          COUNT(*) FILTER (WHERE click_type = 'phone')::int as phone,
          COUNT(*) FILTER (WHERE click_type = 'email')::int as email,
          COUNT(*) FILTER (WHERE click_type = 'whatsapp')::int as whatsapp,
          COUNT(*) FILTER (WHERE click_type = 'maps')::int as maps
        FROM outbound_clicks
        WHERE created_at > NOW() - INTERVAL '7 days'
      `),

      // Enquiries over time (30 days, grouped by day and status)
      db.query(`
        SELECT DATE(created_at) as date,
               status,
               COUNT(*)::int as count
        FROM enquiries
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at), status
        ORDER BY date ASC
      `),

      // Top 10 schools by enquiries
      db.query(`
        SELECT s.name, s.slug, COUNT(*)::int as count
        FROM enquiries e
        JOIN schools s ON s.id = e.school_id
        GROUP BY s.id, s.name, s.slug
        ORDER BY count DESC
        LIMIT 10
      `),

      // Enquiry source breakdown
      db.query(`
        SELECT COALESCE(source, 'direct') as source, COUNT(*)::int as count
        FROM enquiries
        GROUP BY source
        ORDER BY count DESC
      `),

      // Recent 5 enquiries
      db.query(`
        SELECT e.id, e.parent_name, e.parent_email, e.status, e.created_at,
               s.name as school_name, s.slug as school_slug
        FROM enquiries e
        JOIN schools s ON s.id = e.school_id
        ORDER BY e.created_at DESC
        LIMIT 5
      `),

      // Pending claims count
      db.query(`
        SELECT COUNT(*)::int as count
        FROM school_claims
        WHERE status = 'pending'
      `).catch(() => ({ rows: [{ count: 0 }] })),

      // Pipeline health: last run per job
      db.query(`
        SELECT DISTINCT ON (job_name) job_name, status, started_at, completed_at,
               metrics, error_message
        FROM pipeline_v2_runs
        ORDER BY job_name, started_at DESC
      `).catch(() => ({ rows: [] })),
    ]);

    // Transform enquiries over time into a format suitable for stacked area chart
    const dateMap = new Map<string, Record<string, number>>();
    for (const row of enquiriesOverTime.rows) {
      const date = new Date(row.date).toISOString().split("T")[0];
      if (!dateMap.has(date)) dateMap.set(date, { date: 0 } as unknown as Record<string, number>);
      const entry = dateMap.get(date)!;
      entry[row.status] = row.count;
    }
    const enquiriesTimeline = Array.from(dateMap.entries()).map(([date, statuses]) => ({
      date,
      ...statuses,
    }));

    const result = {
      schools: schoolStats.rows[0],
      users: userStats.rows[0],
      enquiries: enquiryStats.rows[0],
      searches_this_week: searchStats.rows[0].total,
      page_views_this_week: pageViewStats.rows[0]?.total ?? 0,
      clicks: clickStats.rows[0],
      charts: {
        enquiries_timeline: enquiriesTimeline,
        top_schools_by_enquiries: topSchoolsByEnquiries.rows,
        enquiry_source_breakdown: enquirySourceBreakdown.rows,
      },
      recent_enquiries: recentEnquiries.rows,
      pending_claims: pendingClaims.rows[0]?.count ?? 0,
      pipeline_health: pipelineHealth.rows,
    };

    await cache.set(cacheKey, result, 300);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
