import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";

// POST /api/school-admin/subscription/checkout — Stripe checkout placeholder
export async function POST(_request: NextRequest) {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  // Check role — only owners can change subscription
  if (adminCheck.role !== "owner") {
    return NextResponse.json(
      { error: "Only the school owner can manage subscriptions" },
      { status: 403 }
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        error: "Payment processing is not yet configured",
        message: "Stripe integration is coming soon. Please contact support@mydscvr.ai to upgrade your plan.",
      },
      { status: 503 }
    );
  }

  // TODO: Implement Stripe Checkout session creation
  return NextResponse.json(
    { error: "Stripe checkout not yet implemented" },
    { status: 501 }
  );
}
