import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";

// GET /api/admin/enquiries — All enquiries (leads) with pagination
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const school_id = searchParams.get("school_id");
  const search = searchParams.get("search");
  const source = searchParams.get("source");
  const date_from = searchParams.get("date_from");
  const date_to = searchParams.get("date_to");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25")));
  const offset = (page - 1) * limit;

  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (status) {
      conditions.push(`e.status = $${idx++}`);
      params.push(status);
    }
    if (school_id) {
      conditions.push(`e.school_id = $${idx++}`);
      params.push(school_id);
    }
    if (search) {
      conditions.push(`(e.parent_name ILIKE $${idx} OR e.parent_email ILIKE $${idx} OR s.name ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (source) {
      conditions.push(`e.source = $${idx++}`);
      params.push(source);
    }
    if (date_from) {
      conditions.push(`e.created_at >= $${idx++}`);
      params.push(date_from);
    }
    if (date_to) {
      conditions.push(`e.created_at <= $${idx++}`);
      params.push(date_to);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [countResult, result] = await Promise.all([
      db.query(
        `SELECT COUNT(*)::int as total FROM enquiries e JOIN schools s ON s.id = e.school_id ${where}`,
        params
      ),
      db.query(
        `SELECT e.*, s.name as school_name, s.slug as school_slug,
                EXTRACT(DAY FROM NOW() - e.created_at)::int as days_waiting
         FROM enquiries e
         JOIN schools s ON s.id = e.school_id
         ${where}
         ORDER BY e.created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, limit, offset]
      ),
    ]);

    return NextResponse.json({
      enquiries: result.rows,
      total: countResult.rows[0].total,
      page,
      limit,
      total_pages: Math.ceil(countResult.rows[0].total / limit),
    });
  } catch (error) {
    console.error("Admin enquiries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}
