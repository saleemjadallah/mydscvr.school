import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { getStripe } from "@/lib/stripe";
import db from "@/db";

// POST /api/school-admin/subscription/cancel — Cancel subscription at period end
export async function POST() {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  if (adminCheck.role !== "owner") {
    return NextResponse.json(
      { error: "Only the school owner can cancel subscriptions" },
      { status: 403 }
    );
  }

  try {
    const result = await db.query(
      `UPDATE school_subscriptions
       SET cancel_at_period_end = true
       WHERE school_id = $1 AND status IN ('active', 'trialing')
       RETURNING id, plan, current_period_end, stripe_subscription_id`,
      [adminCheck.schoolId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Cancel in Stripe if subscription has a Stripe ID
    const stripeSubId = result.rows[0].stripe_subscription_id;
    if (stripeSubId) {
      const stripe = getStripe();
      if (stripe) {
        try {
          await stripe.subscriptions.update(stripeSubId, {
            cancel_at_period_end: true,
          });
        } catch (stripeErr) {
          console.error("Stripe cancel error (local DB updated):", stripeErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Your ${result.rows[0].plan} plan will cancel at the end of the current billing period.`,
      cancel_date: result.rows[0].current_period_end,
    });
  } catch (error) {
    console.error("School admin subscription cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
