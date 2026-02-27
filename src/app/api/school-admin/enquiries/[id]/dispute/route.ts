import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import db from "@/db";
import { MAX_AUTO_DISPUTE_CREDITS } from "@/lib/plans";

// POST /api/school-admin/enquiries/:id/dispute — Dispute invalid enquiry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  const { id } = await params;
  const { reason } = await request.json();

  if (!reason?.trim()) {
    return NextResponse.json({ error: "Dispute reason is required" }, { status: 400 });
  }

  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    // Verify enquiry belongs to this school and is billed
    const enquiry = await client.query(
      `SELECT id, is_billed, billed_amount FROM enquiries
       WHERE id = $1 AND school_id = $2`,
      [id, adminCheck.schoolId]
    );

    if (enquiry.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    if (!enquiry.rows[0].is_billed) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Enquiry was not billed" }, { status: 400 });
    }

    // Check existing disputes for this enquiry
    const existingDispute = await client.query(
      `SELECT id FROM enquiry_billing_events
       WHERE enquiry_id = $1 AND event_type IN ('disputed', 'dispute_auto_credited', 'dispute_pending_review')`,
      [id]
    );

    if (existingDispute.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Enquiry already disputed" }, { status: 400 });
    }

    // Check how many auto-credits this month
    const autoCreditsResult = await client.query(
      `SELECT COUNT(*) AS cnt FROM enquiry_billing_events
       WHERE school_id = $1 AND event_type = 'dispute_auto_credited'
         AND created_at > DATE_TRUNC('month', NOW())`,
      [adminCheck.schoolId]
    );
    const autoCreditsUsed = Number(autoCreditsResult.rows[0].cnt);

    let eventType: string;
    let creditBack = false;

    if (autoCreditsUsed < MAX_AUTO_DISPUTE_CREDITS) {
      // Auto-credit back
      eventType = "dispute_auto_credited";
      creditBack = true;

      // Refund the credit in the ledger
      const billedAmount = enquiry.rows[0].billed_amount ?? 0;
      if (billedAmount > 0) {
        // It was an overage or free-tier charge — reduce overage total
        await client.query(
          `UPDATE school_credit_ledger
           SET overage_total = GREATEST(0, overage_total - $2),
               overage_count = GREATEST(0, overage_count - 1),
               disputes_auto_credited = disputes_auto_credited + 1
           WHERE school_id = $1 AND period_start = (
             SELECT period_start FROM school_credit_ledger
             WHERE school_id = $1 ORDER BY period_start DESC LIMIT 1
           )`,
          [adminCheck.schoolId, billedAmount]
        );
      } else {
        // It was a credit_used — give credit back
        await client.query(
          `UPDATE school_credit_ledger
           SET credits_used = GREATEST(0, credits_used - 1),
               disputes_auto_credited = disputes_auto_credited + 1
           WHERE school_id = $1 AND period_start = (
             SELECT period_start FROM school_credit_ledger
             WHERE school_id = $1 ORDER BY period_start DESC LIMIT 1
           )`,
          [adminCheck.schoolId]
        );
      }
    } else {
      // Needs manual review
      eventType = "dispute_pending_review";
    }

    // Create the dispute event
    await client.query(
      `INSERT INTO enquiry_billing_events
         (enquiry_id, school_id, event_type, amount, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        adminCheck.schoolId,
        eventType,
        creditBack ? -(enquiry.rows[0].billed_amount ?? 0) : 0,
        reason.trim(),
        adminCheck.userId,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      auto_credited: creditBack,
      event_type: eventType,
      message: creditBack
        ? "Dispute accepted. Credit has been refunded."
        : "Dispute submitted for review. Our team will review within 2 business days.",
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("School admin dispute error:", error);
    return NextResponse.json(
      { error: "Failed to process dispute" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
