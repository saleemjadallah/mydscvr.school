import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import db from "@/db";
import { PLAN_CONFIG, PLAN_ORDER } from "@/lib/plans";

// GET /api/school-admin/subscription — Current subscription + all plans
export async function GET() {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  try {
    const subResult = await db.query(
      `SELECT * FROM school_subscriptions
       WHERE school_id = $1 AND status IN ('active', 'trialing', 'past_due')
       LIMIT 1`,
      [adminCheck.schoolId]
    );

    const subscription = subResult.rows[0] ?? null;
    const currentPlan = subscription?.plan ?? "free";

    return NextResponse.json({
      subscription,
      current_plan: currentPlan,
      plans: PLAN_ORDER.map((id) => ({
        ...PLAN_CONFIG[id],
        is_current: id === currentPlan,
      })),
    });
  } catch (error) {
    console.error("School admin subscription error:", error);
    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 500 }
    );
  }
}
