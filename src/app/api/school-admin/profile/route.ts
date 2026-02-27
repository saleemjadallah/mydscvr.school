import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import db from "@/db";

// GET /api/school-admin/profile — School profile data for editing
export async function GET() {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  try {
    const result = await db.query(
      `SELECT s.*,
              (SELECT json_agg(sp ORDER BY sp.sort_order)
               FROM school_photos sp WHERE sp.school_id = s.id AND sp.is_active = true
              ) AS photos
       FROM schools s WHERE s.id = $1`,
      [adminCheck.schoolId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json({ school: result.rows[0] });
  } catch (error) {
    console.error("School admin profile error:", error);
    return NextResponse.json(
      { error: "Failed to load school profile" },
      { status: 500 }
    );
  }
}

// PUT /api/school-admin/profile — Update school profile (allowed fields only)
export async function PUT(request: NextRequest) {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  const body = await request.json();

  // Only allow school admins to update these fields
  const allowedFields = [
    "description", "phone", "email", "website", "whatsapp", "admission_email",
    "address", "has_sen_support", "has_transport", "has_boarding",
    "has_after_school", "has_sports_facilities", "has_swimming_pool",
    "has_arts_program",
  ];

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = $${idx++}`);
      values.push(body[field]);
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  values.push(adminCheck.schoolId);

  try {
    const result = await db.query(
      `UPDATE schools SET ${updates.join(", ")}, updated_at = NOW()
       WHERE id = $${idx}
       RETURNING *`,
      values
    );

    return NextResponse.json({ success: true, school: result.rows[0] });
  } catch (error) {
    console.error("School admin profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update school profile" },
      { status: 500 }
    );
  }
}
