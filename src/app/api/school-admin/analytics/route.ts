import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import db from "@/db";

// GET /api/school-admin/analytics — Profile views, clicks, enquiry funnel
export async function GET(request: NextRequest) {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  const { schoolId } = adminCheck;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "30d";

  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;

  try {
    // Profile views over time
    const viewsResult = await db.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM page_views
       WHERE school_id = $1 AND created_at > NOW() - $2::int * INTERVAL '1 day'
       GROUP BY DATE(created_at) ORDER BY date`,
      [schoolId, days]
    );

    // Clicks by type
    const clicksResult = await db.query(
      `SELECT click_type, COUNT(*) AS count
       FROM outbound_clicks
       WHERE school_id = $1 AND created_at > NOW() - $2::int * INTERVAL '1 day'
       GROUP BY click_type ORDER BY count DESC`,
      [schoolId, days]
    );

    // Enquiry funnel
    const funnelResult = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM page_views WHERE school_id = $1 AND created_at > NOW() - $2::int * INTERVAL '1 day') AS views,
         (SELECT COUNT(*) FROM enquiries WHERE school_id = $1 AND created_at > NOW() - $2::int * INTERVAL '1 day') AS enquiries,
         (SELECT COUNT(*) FROM enquiries WHERE school_id = $1 AND status = 'responded' AND created_at > NOW() - $2::int * INTERVAL '1 day') AS responded,
         (SELECT COUNT(*) FROM enquiries WHERE school_id = $1 AND status = 'enrolled' AND created_at > NOW() - $2::int * INTERVAL '1 day') AS enrolled`,
      [schoolId, days]
    );

    // Top search queries that led to this school
    const queriesResult = await db.query(
      `SELECT sl.query, COUNT(*) AS count
       FROM search_logs sl
       WHERE sl.created_at > NOW() - $2::int * INTERVAL '1 day'
         AND sl.structured_intent::text LIKE '%' || $1 || '%'
       GROUP BY sl.query
       ORDER BY count DESC LIMIT 10`,
      [schoolId, days]
    );

    // Previous period comparison
    const prevViewsResult = await db.query(
      `SELECT COUNT(*) AS count FROM page_views
       WHERE school_id = $1
         AND created_at > NOW() - ($2::int * 2) * INTERVAL '1 day'
         AND created_at <= NOW() - $2::int * INTERVAL '1 day'`,
      [schoolId, days]
    );
    const prevEnquiriesResult = await db.query(
      `SELECT COUNT(*) AS count FROM enquiries
       WHERE school_id = $1
         AND created_at > NOW() - ($2::int * 2) * INTERVAL '1 day'
         AND created_at <= NOW() - $2::int * INTERVAL '1 day'`,
      [schoolId, days]
    );

    const currentViews = viewsResult.rows.reduce((sum: number, r: { count: string }) => sum + Number(r.count), 0);
    const prevViews = Number(prevViewsResult.rows[0]?.count ?? 0);
    const currentEnquiries = Number(funnelResult.rows[0]?.enquiries ?? 0);
    const prevEnquiries = Number(prevEnquiriesResult.rows[0]?.count ?? 0);

    return NextResponse.json({
      profile_views: viewsResult.rows.map((r: { date: string; count: string }) => ({
        date: r.date,
        count: Number(r.count),
      })),
      clicks_by_type: clicksResult.rows.map((r: { click_type: string; count: string }) => ({
        click_type: r.click_type,
        count: Number(r.count),
      })),
      enquiry_funnel: {
        views: Number(funnelResult.rows[0]?.views ?? 0),
        enquiries: currentEnquiries,
        responded: Number(funnelResult.rows[0]?.responded ?? 0),
        enrolled: Number(funnelResult.rows[0]?.enrolled ?? 0),
      },
      top_queries: queriesResult.rows.map((r: { query: string; count: string }) => ({
        query: r.query,
        count: Number(r.count),
      })),
      period,
      previous_period: {
        profile_views: prevViews,
        enquiries: prevEnquiries,
        views_delta: prevViews > 0 ? Math.round(((currentViews - prevViews) / prevViews) * 100) : 0,
        enquiries_delta: prevEnquiries > 0 ? Math.round(((currentEnquiries - prevEnquiries) / prevEnquiries) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("School admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
