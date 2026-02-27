import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import db from "@/db";

// GET /api/school-admin/subscription/invoices — Billing history
export async function GET() {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  try {
    // Build invoices from credit ledger periods + subscription fees
    const result = await db.query(
      `SELECT cl.id, cl.period_start, cl.period_end,
              cl.credits_included, cl.credits_used, cl.overage_count,
              cl.overage_total, cl.disputes_auto_credited,
              ss.plan, ss.monthly_price, ss.billing_cycle
       FROM school_credit_ledger cl
       LEFT JOIN school_subscriptions ss ON ss.id = cl.subscription_id
       WHERE cl.school_id = $1
       ORDER BY cl.period_start DESC
       LIMIT 24`,
      [adminCheck.schoolId]
    );

    const invoices = result.rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      period_start: r.period_start,
      period_end: r.period_end,
      plan: r.plan ?? "free",
      subscription_fee: r.monthly_price ?? 0,
      overage_charges: r.overage_total ?? 0,
      total: ((r.monthly_price as number) ?? 0) + ((r.overage_total as number) ?? 0),
      credits_used: r.credits_used,
      credits_included: r.credits_included,
      overage_count: r.overage_count,
      disputes_credited: r.disputes_auto_credited,
    }));

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("School admin invoices error:", error);
    return NextResponse.json(
      { error: "Failed to load invoices" },
      { status: 500 }
    );
  }
}
