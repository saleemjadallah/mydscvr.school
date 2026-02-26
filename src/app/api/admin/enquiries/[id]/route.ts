import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin-auth";
import db from "@/db";

// PATCH /api/admin/enquiries/:id — Update enquiry status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const { id } = await params;
  const { status, admin_notes } = await request.json();

  const validStatuses = ["new", "sent_to_school", "responded", "enrolled", "closed"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const before = await db.query(`SELECT status, admin_notes FROM enquiries WHERE id = $1`, [id]);
    if (before.rows.length === 0) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    const updates: string[] = [];
    const values: unknown[] = [id];
    let idx = 2;

    if (status) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (admin_notes !== undefined) {
      updates.push(`admin_notes = $${idx++}`);
      values.push(admin_notes);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No updates" }, { status: 400 });
    }

    updates.push("updated_at = NOW()");

    await db.query(
      `UPDATE enquiries SET ${updates.join(", ")} WHERE id = $1`,
      values
    );

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    await logAdminAction(db, {
      adminUserId: adminCheck.userId,
      action: "update_enquiry_status",
      targetType: "enquiry",
      targetId: id,
      changes: {
        before: before.rows[0],
        after: { status, admin_notes },
      },
      ipAddress: ip,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin enquiry update error:", error);
    return NextResponse.json(
      { error: "Failed to update enquiry" },
      { status: 500 }
    );
  }
}
