import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin-auth";
import db from "@/db";

// PATCH /api/admin/claims/:id — Approve/reject claim
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const { id } = await params;
  const { status } = await request.json();

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Status must be 'approved' or 'rejected'" }, { status: 400 });
  }

  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const before = await client.query(`SELECT * FROM school_claims WHERE id = $1`, [id]);
    if (before.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const claim = before.rows[0];

    await client.query(
      `UPDATE school_claims SET status = $2, reviewed_at = NOW(), reviewed_by = $3 WHERE id = $1`,
      [id, status, adminCheck.userId]
    );

    // On approval: create school_admin record + mark school as claimed
    if (status === "approved") {
      // Find or match user by email from claim (contact_email is the column name)
      const userResult = await client.query(
        `SELECT clerk_id, email, name FROM users WHERE email = $1 LIMIT 1`,
        [claim.contact_email]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        await client.query(
          `INSERT INTO school_admins (school_id, clerk_user_id, email, name, role)
           VALUES ($1, $2, $3, $4, 'owner')
           ON CONFLICT (school_id, clerk_user_id) DO UPDATE SET is_active = true`,
          [claim.school_id, user.clerk_id, user.email, user.name]
        );
      }

      // Mark school as claimed
      await client.query(
        `UPDATE schools SET is_claimed = true WHERE id = $1`,
        [claim.school_id]
      );

      // Create free-tier subscription if none exists
      await client.query(
        `INSERT INTO school_subscriptions (school_id, plan, status, monthly_price)
         VALUES ($1, 'free', 'active', 0)
         ON CONFLICT (school_id) WHERE status IN ('active', 'trialing', 'past_due') DO NOTHING`,
        [claim.school_id]
      );
    }

    await client.query("COMMIT");

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    await logAdminAction(db, {
      adminUserId: adminCheck.userId,
      action: status === "approved" ? "approve_claim" : "reject_claim",
      targetType: "claim",
      targetId: id,
      changes: { before: { status: claim.status }, after: { status } },
      ipAddress: ip,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Admin claim update error:", error);
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
