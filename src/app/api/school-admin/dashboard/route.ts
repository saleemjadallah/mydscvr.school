import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import db from "@/db";
import { cache } from "@/lib/cache";
import { getPlanConfig } from "@/lib/plans";

// GET /api/school-admin/dashboard — Overview KPIs
export async function GET() {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  const { schoolId } = adminCheck;
  const cacheKey = `school-admin:dashboard:${schoolId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // Profile views (30d + delta)
    const viewsResult = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS views_30d,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '60 days' AND created_at <= NOW() - INTERVAL '30 days') AS views_prev_30d
       FROM page_views
       WHERE school_id = $1`,
      [schoolId]
    );
    const views30d = Number(viewsResult.rows[0]?.views_30d ?? 0);
    const viewsPrev30d = Number(viewsResult.rows[0]?.views_prev_30d ?? 0);
    const viewsDelta = viewsPrev30d > 0
      ? Math.round(((views30d - viewsPrev30d) / viewsPrev30d) * 100)
      : 0;

    // Enquiries (30d + delta)
    const enquiryResult = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS enquiries_30d,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '60 days' AND created_at <= NOW() - INTERVAL '30 days') AS enquiries_prev_30d
       FROM enquiries
       WHERE school_id = $1`,
      [schoolId]
    );
    const enquiries30d = Number(enquiryResult.rows[0]?.enquiries_30d ?? 0);
    const enquiriesPrev30d = Number(enquiryResult.rows[0]?.enquiries_prev_30d ?? 0);
    const enquiriesDelta = enquiriesPrev30d > 0
      ? Math.round(((enquiries30d - enquiriesPrev30d) / enquiriesPrev30d) * 100)
      : 0;

    // Credit status
    const subResult = await db.query(
      `SELECT plan, status FROM school_subscriptions
       WHERE school_id = $1 AND status IN ('active', 'trialing')
       LIMIT 1`,
      [schoolId]
    );
    const plan = subResult.rows[0]?.plan ?? "free";
    const planConfig = getPlanConfig(plan);

    const ledgerResult = await db.query(
      `SELECT credits_included, credits_used, overage_count, overage_total,
              period_start, period_end
       FROM school_credit_ledger
       WHERE school_id = $1
       ORDER BY period_start DESC LIMIT 1`,
      [schoolId]
    );
    const ledger = ledgerResult.rows[0];
    const creditStatus = {
      credits_included: ledger?.credits_included ?? planConfig.credits,
      credits_used: ledger?.credits_used ?? 0,
      credits_remaining: (ledger?.credits_included ?? planConfig.credits) - (ledger?.credits_used ?? 0),
      overage_count: ledger?.overage_count ?? 0,
      overage_total: ledger?.overage_total ?? 0,
      period_start: ledger?.period_start ?? new Date().toISOString(),
      period_end: ledger?.period_end ?? new Date().toISOString(),
      plan,
    };

    // Recent enquiries (10)
    const recentResult = await db.query(
      `SELECT e.id, e.parent_name, e.parent_email, e.parent_phone, e.child_grade,
              e.message, e.source, e.status, e.is_billed, e.billed_amount, e.created_at,
              e.responded_at,
              eb.event_type AS billing_event_type
       FROM enquiries e
       LEFT JOIN enquiry_billing_events eb ON eb.enquiry_id = e.id
       WHERE e.school_id = $1
       ORDER BY e.created_at DESC LIMIT 10`,
      [schoolId]
    );

    // Enquiry trend (30d daily)
    const trendResult = await db.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM enquiries
       WHERE school_id = $1 AND created_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at) ORDER BY date`,
      [schoolId]
    );

    const data = {
      profile_views_30d: views30d,
      profile_views_delta: viewsDelta,
      enquiries_30d: enquiries30d,
      enquiries_delta: enquiriesDelta,
      credit_status: creditStatus,
      plan,
      recent_enquiries: recentResult.rows,
      enquiry_trend: trendResult.rows.map((r: { date: string; count: string }) => ({
        date: r.date,
        count: Number(r.count),
      })),
    };

    await cache.set(cacheKey, data, 120); // 2min cache
    return NextResponse.json(data);
  } catch (error) {
    console.error("School admin dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
