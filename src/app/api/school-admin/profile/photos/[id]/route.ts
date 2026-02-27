import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import db from "@/db";

// DELETE /api/school-admin/profile/photos/:id — Delete photo
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  const { id } = await params;

  try {
    const result = await db.query(
      `UPDATE school_photos SET is_active = false
       WHERE id = $1 AND school_id = $2
       RETURNING id`,
      [id, adminCheck.schoolId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("School admin photo delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
