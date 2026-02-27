import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import db from "@/db";

// GET /api/school-admin/credits/history — Past billing periods
export async function GET() {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  try {
    const result = await db.query(
      `SELECT id, period_start, period_end, credits_included, credits_used,
              overage_count, overage_rate, overage_total, disputes_auto_credited,
              created_at
       FROM school_credit_ledger
       WHERE school_id = $1
       ORDER BY period_start DESC
       LIMIT 12`,
      [adminCheck.schoolId]
    );

    return NextResponse.json({ periods: result.rows });
  } catch (error) {
    console.error("School admin credit history error:", error);
    return NextResponse.json(
      { error: "Failed to load credit history" },
      { status: 500 }
    );
  }
}
