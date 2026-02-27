import type { PoolClient } from "pg";
import { getPlanConfig, UNLIMITED_CREDITS, DUPLICATE_WINDOW_DAYS } from "./plans";

export interface BillingResult {
  is_billed: boolean;
  billed_amount: number;
  event_type: string;
  ledger_id: string | null;
}

/**
 * Process billing for an enquiry within an existing transaction.
 * Must be called with a PoolClient that already has BEGIN.
 *
 * Billing logic (in order):
 * 1. Duplicate check — same email + school within 30 days
 * 2. Lookup active subscription
 * 3. Get/create credit ledger for current period
 * 4. Process: enterprise unlimited | free tier | paid with credits | paid overage
 */
export async function processEnquiryBilling(
  client: PoolClient,
  enquiryId: string,
  schoolId: string,
  parentEmail: string
): Promise<BillingResult> {
  // 1. Duplicate check
  const dupResult = await client.query(
    `SELECT id FROM enquiries
     WHERE school_id = $1 AND parent_email = $2 AND id != $3
       AND created_at > NOW() - $4::int * INTERVAL '1 day'
     LIMIT 1`,
    [schoolId, parentEmail, enquiryId, DUPLICATE_WINDOW_DAYS]
  );

  if (dupResult.rows.length > 0) {
    await client.query(
      `INSERT INTO enquiry_billing_events
         (enquiry_id, school_id, event_type, amount, notes, created_by)
       VALUES ($1, $2, 'duplicate_skipped', 0, $3, 'system')`,
      [enquiryId, schoolId, `Duplicate of enquiry ${dupResult.rows[0].id}`]
    );
    return { is_billed: false, billed_amount: 0, event_type: "duplicate_skipped", ledger_id: null };
  }

  // 2. Lookup active subscription
  const subResult = await client.query(
    `SELECT id, plan, status, current_period_start, current_period_end
     FROM school_subscriptions
     WHERE school_id = $1 AND status IN ('active', 'trialing')
     LIMIT 1`,
    [schoolId]
  );

  const subscription = subResult.rows[0] ?? null;
  const plan = getPlanConfig(subscription?.plan ?? "free");

  // 3. Get/create credit ledger for current billing period
  let periodStart: string;
  let periodEnd: string;

  if (subscription?.current_period_start && subscription?.current_period_end) {
    periodStart = new Date(subscription.current_period_start).toISOString().split("T")[0];
    periodEnd = new Date(subscription.current_period_end).toISOString().split("T")[0];
  } else {
    // Free tier: use calendar month
    const now = new Date();
    periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    periodEnd = nextMonth.toISOString().split("T")[0];
  }

  // UPSERT then lock the row to prevent TOCTOU race on credits_remaining
  await client.query(
    `INSERT INTO school_credit_ledger
       (school_id, subscription_id, period_start, period_end, credits_included, overage_rate)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (school_id, period_start) DO UPDATE SET
       subscription_id = COALESCE(EXCLUDED.subscription_id, school_credit_ledger.subscription_id)`,
    [
      schoolId,
      subscription?.id ?? null,
      periodStart,
      periodEnd,
      plan.credits,
      plan.overageRate,
    ]
  );

  const ledgerResult = await client.query(
    `SELECT id, credits_included, credits_used, overage_count
     FROM school_credit_ledger
     WHERE school_id = $1 AND period_start = $2
     FOR UPDATE`,
    [schoolId, periodStart]
  );

  const ledger = ledgerResult.rows[0];
  const ledgerId = ledger.id;
  const creditsRemaining = ledger.credits_included - ledger.credits_used;

  // 4. Process billing
  let eventType: string;
  let amount: number;
  let creditBalanceAfter: number;

  if (plan.credits >= UNLIMITED_CREDITS) {
    // Enterprise: unlimited credits
    eventType = "credit_used";
    amount = 0;
    await client.query(
      `UPDATE school_credit_ledger SET credits_used = credits_used + 1 WHERE id = $1`,
      [ledgerId]
    );
    creditBalanceAfter = ledger.credits_included - ledger.credits_used - 1;
  } else if (!subscription) {
    // Free tier: charge per enquiry
    eventType = "free_tier_charged";
    amount = plan.overageRate;
    await client.query(
      `UPDATE school_credit_ledger
       SET overage_count = overage_count + 1,
           overage_total = overage_total + $2
       WHERE id = $1`,
      [ledgerId, amount]
    );
    creditBalanceAfter = 0;
  } else if (creditsRemaining > 0) {
    // Paid plan with credits remaining
    eventType = "credit_used";
    amount = 0;
    await client.query(
      `UPDATE school_credit_ledger SET credits_used = credits_used + 1 WHERE id = $1`,
      [ledgerId]
    );
    creditBalanceAfter = creditsRemaining - 1;
  } else {
    // Paid plan, credits exhausted — overage
    eventType = "overage_charged";
    amount = plan.overageRate;
    await client.query(
      `UPDATE school_credit_ledger
       SET overage_count = overage_count + 1,
           overage_total = overage_total + $2
       WHERE id = $1`,
      [ledgerId, amount]
    );
    creditBalanceAfter = 0;
  }

  // Create billing event
  await client.query(
    `INSERT INTO enquiry_billing_events
       (enquiry_id, school_id, ledger_id, event_type, amount, credit_balance_after, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, 'system')`,
    [enquiryId, schoolId, ledgerId, eventType, amount, creditBalanceAfter]
  );

  return {
    is_billed: eventType !== "duplicate_skipped",
    billed_amount: amount,
    event_type: eventType,
    ledger_id: ledgerId,
  };
}
