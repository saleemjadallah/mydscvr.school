import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import db from "@/db";

// GET /api/school-admin/enquiries/:id — Single enquiry detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  const { id } = await params;

  try {
    const result = await db.query(
      `SELECT e.*, eb.event_type AS billing_event_type, eb.amount AS billing_amount
       FROM enquiries e
       LEFT JOIN LATERAL (
         SELECT event_type, amount FROM enquiry_billing_events
         WHERE enquiry_id = e.id ORDER BY created_at DESC LIMIT 1
       ) eb ON true
       WHERE e.id = $1 AND e.school_id = $2`,
      [id, adminCheck.schoolId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ enquiry: result.rows[0] });
  } catch (error) {
    console.error("School admin enquiry detail error:", error);
    return NextResponse.json(
      { error: "Failed to load enquiry" },
      { status: 500 }
    );
  }
}

// PUT /api/school-admin/enquiries/:id — Update enquiry status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  const { id } = await params;
  const { status } = await request.json();

  const validStatuses = ["new", "sent_to_school", "responded", "enrolled", "rejected"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Status must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const result = await db.query(
      `UPDATE enquiries
       SET status = $2,
           responded_at = CASE WHEN $2 = 'responded' AND responded_at IS NULL THEN NOW() ELSE responded_at END
       WHERE id = $1 AND school_id = $3
       RETURNING *`,
      [id, status, adminCheck.schoolId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, enquiry: result.rows[0] });
  } catch (error) {
    console.error("School admin enquiry update error:", error);
    return NextResponse.json(
      { error: "Failed to update enquiry" },
      { status: 500 }
    );
  }
}
