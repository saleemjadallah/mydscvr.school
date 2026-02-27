import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import db from "@/db";
import { getPlanConfig } from "@/lib/plans";

// GET /api/school-admin/credits — Current period credit status
export async function GET() {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  const { schoolId } = adminCheck;

  try {
    const subResult = await db.query(
      `SELECT plan FROM school_subscriptions
       WHERE school_id = $1 AND status IN ('active', 'trialing')
       LIMIT 1`,
      [schoolId]
    );
    const plan = subResult.rows[0]?.plan ?? "free";
    const planConfig = getPlanConfig(plan);

    const ledgerResult = await db.query(
      `SELECT * FROM school_credit_ledger
       WHERE school_id = $1 ORDER BY period_start DESC LIMIT 1`,
      [schoolId]
    );

    const ledger = ledgerResult.rows[0];

    return NextResponse.json({
      credits_included: ledger?.credits_included ?? planConfig.credits,
      credits_used: ledger?.credits_used ?? 0,
      credits_remaining: (ledger?.credits_included ?? planConfig.credits) - (ledger?.credits_used ?? 0),
      overage_count: ledger?.overage_count ?? 0,
      overage_rate: planConfig.overageRate,
      overage_total: ledger?.overage_total ?? 0,
      disputes_auto_credited: ledger?.disputes_auto_credited ?? 0,
      period_start: ledger?.period_start ?? null,
      period_end: ledger?.period_end ?? null,
      plan,
      plan_name: planConfig.name,
    });
  } catch (error) {
    console.error("School admin credits error:", error);
    return NextResponse.json(
      { error: "Failed to load credit status" },
      { status: 500 }
    );
  }
}
