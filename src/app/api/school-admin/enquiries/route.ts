import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import db from "@/db";

// GET /api/school-admin/enquiries — Paginated enquiry list
export async function GET(request: NextRequest) {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  const { schoolId } = adminCheck;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 25)));
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status");
  const source = searchParams.get("source");

  const clauses = ["e.school_id = $1"];
  const params: unknown[] = [schoolId];
  let idx = 2;

  if (search) {
    clauses.push(`(e.parent_name ILIKE $${idx} OR e.parent_email ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }
  if (status) {
    clauses.push(`e.status = $${idx++}`);
    params.push(status);
  }
  if (source) {
    clauses.push(`e.source = $${idx++}`);
    params.push(source);
  }

  const where = clauses.join(" AND ");
  const offset = (page - 1) * limit;

  try {
    const [countResult, dataResult] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM enquiries e WHERE ${where}`, params),
      db.query(
        `SELECT e.id, e.parent_name, e.parent_email, e.parent_phone, e.child_grade,
                e.child_name, e.message, e.source, e.status, e.is_billed, e.billed_amount,
                e.created_at, e.responded_at, e.sent_to_school_at,
                eb.event_type AS billing_event_type
         FROM enquiries e
         LEFT JOIN LATERAL (
           SELECT event_type FROM enquiry_billing_events
           WHERE enquiry_id = e.id ORDER BY created_at DESC LIMIT 1
         ) eb ON true
         WHERE ${where}
         ORDER BY e.created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, limit, offset]
      ),
    ]);

    const total = Number(countResult.rows[0].count);
    return NextResponse.json({
      enquiries: dataResult.rows,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("School admin enquiries error:", error);
    return NextResponse.json(
      { error: "Failed to load enquiries" },
      { status: 500 }
    );
  }
}
