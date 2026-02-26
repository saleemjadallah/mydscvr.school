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

  try {
    const before = await db.query(`SELECT status FROM school_claims WHERE id = $1`, [id]);
    if (before.rows.length === 0) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    await db.query(
      `UPDATE school_claims SET status = $2, reviewed_at = NOW(), reviewed_by = $3 WHERE id = $1`,
      [id, status, adminCheck.userId]
    );

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    await logAdminAction(db, {
      adminUserId: adminCheck.userId,
      action: status === "approved" ? "approve_claim" : "reject_claim",
      targetType: "claim",
      targetId: id,
      changes: { before: before.rows[0], after: { status } },
      ipAddress: ip,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin claim update error:", error);
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 }
    );
  }
}
