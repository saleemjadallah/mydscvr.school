import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, getStripe } from "@/lib/stripe";
import db from "@/db";
import { getPlanConfig, type PlanId } from "@/lib/plans";

// POST /api/webhooks/stripe — Stripe webhook handler
export async function POST(request: NextRequest) {
  if (!getStripe()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const event = constructWebhookEvent(body, signature);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as unknown as Record<string, unknown>;
        const metadata = (session.metadata ?? {}) as Record<string, string>;
        const schoolId = metadata.school_id;
        const planId = metadata.plan as PlanId;
        const billingCycle = metadata.billing_cycle ?? "monthly";

        if (!schoolId || !planId) break;

        const planConfig = getPlanConfig(planId);
        const price = billingCycle === "annual" ? planConfig.annualPrice : planConfig.monthlyPrice;
        const periodInterval = billingCycle === "annual" ? "1 year" : "1 month";

        await db.query(
          `INSERT INTO school_subscriptions
             (school_id, plan, status, billing_cycle, monthly_price,
              stripe_customer_id, stripe_subscription_id,
              current_period_start, current_period_end)
           VALUES ($1, $2, 'active', $3, $4, $5, $6, NOW(), NOW() + $7::interval)
           ON CONFLICT (school_id) WHERE status IN ('active', 'trialing', 'past_due')
           DO UPDATE SET
             plan = EXCLUDED.plan,
             status = 'active',
             billing_cycle = EXCLUDED.billing_cycle,
             monthly_price = EXCLUDED.monthly_price,
             stripe_customer_id = EXCLUDED.stripe_customer_id,
             stripe_subscription_id = EXCLUDED.stripe_subscription_id,
             current_period_start = NOW(),
             current_period_end = NOW() + $7::interval`,
          [
            schoolId, planId, billingCycle, price,
            session.customer as string,
            session.subscription as string,
            periodInterval,
          ]
        );
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Extend period based on billing cycle + create new credit ledger
        const sub = await db.query(
          `UPDATE school_subscriptions
           SET status = 'active',
               current_period_start = NOW(),
               current_period_end = NOW() + CASE WHEN billing_cycle = 'annual' THEN INTERVAL '1 year' ELSE INTERVAL '1 month' END
           WHERE stripe_subscription_id = $1
           RETURNING id, school_id, plan, billing_cycle, current_period_start, current_period_end`,
          [subscriptionId]
        );

        if (sub.rows.length > 0) {
          const { id, school_id, plan, current_period_start, current_period_end } = sub.rows[0];
          const planConfig = getPlanConfig(plan);
          const periodStart = new Date(current_period_start).toISOString().split("T")[0];
          const periodEnd = new Date(current_period_end).toISOString().split("T")[0];

          await db.query(
            `INSERT INTO school_credit_ledger
               (school_id, subscription_id, period_start, period_end,
                credits_included, overage_rate)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (school_id, period_start) DO UPDATE SET
               subscription_id = EXCLUDED.subscription_id,
               credits_included = EXCLUDED.credits_included,
               overage_rate = EXCLUDED.overage_rate`,
            [school_id, id, periodStart, periodEnd,
             planConfig.credits, planConfig.overageRate]
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          await db.query(
            `UPDATE school_subscriptions SET status = 'past_due'
             WHERE stripe_subscription_id = $1`,
            [subscriptionId]
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as unknown as Record<string, unknown>;
        const stripeSubId = subscription.id as string;

        // Cancel and downgrade to free
        await db.query(
          `UPDATE school_subscriptions
           SET status = 'canceled', cancel_at_period_end = false
           WHERE stripe_subscription_id = $1`,
          [stripeSubId]
        );

        // Find school and create free tier sub
        const existing = await db.query(
          `SELECT school_id FROM school_subscriptions
           WHERE stripe_subscription_id = $1`,
          [stripeSubId]
        );

        if (existing.rows.length > 0) {
          await db.query(
            `INSERT INTO school_subscriptions (school_id, plan, status, monthly_price)
             VALUES ($1, 'free', 'active', 0)
             ON CONFLICT (school_id) WHERE status IN ('active', 'trialing', 'past_due') DO NOTHING`,
            [existing.rows[0].school_id]
          );
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
