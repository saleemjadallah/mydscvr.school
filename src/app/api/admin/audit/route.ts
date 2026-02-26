import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";

// GET /api/admin/audit — Audit log entries
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const sp = request.nextUrl.searchParams;
  const action = sp.get("action");
  const targetType = sp.get("target_type");
  const dateFrom = sp.get("date_from");
  const dateTo = sp.get("date_to");
  const page = Math.max(1, parseInt(sp.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "50")));
  const offset = (page - 1) * limit;

  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (action) {
      conditions.push(`action = $${idx++}`);
      params.push(action);
    }
    if (targetType) {
      conditions.push(`target_type = $${idx++}`);
      params.push(targetType);
    }
    if (dateFrom) {
      conditions.push(`created_at >= $${idx++}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`created_at <= $${idx++}`);
      params.push(dateTo);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [countResult, result] = await Promise.all([
      db.query(`SELECT COUNT(*)::int as total FROM admin_audit_log ${where}`, params),
      db.query(
        `SELECT * FROM admin_audit_log
         ${where}
         ORDER BY created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, limit, offset]
      ),
    ]);

    return NextResponse.json({
      entries: result.rows,
      total: countResult.rows[0].total,
      page,
      limit,
      total_pages: Math.ceil(countResult.rows[0].total / limit),
    });
  } catch (error) {
    console.error("Admin audit error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit log" },
      { status: 500 }
    );
  }
}
