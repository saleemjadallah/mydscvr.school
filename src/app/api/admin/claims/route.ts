import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";

// GET /api/admin/claims — List school claims
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const sp = request.nextUrl.searchParams;
  const status = sp.get("status");
  const page = Math.max(1, parseInt(sp.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "25")));
  const offset = (page - 1) * limit;

  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (status) {
      conditions.push(`c.status = $${idx++}`);
      params.push(status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [countResult, result] = await Promise.all([
      db.query(`SELECT COUNT(*)::int as total FROM school_claims c ${where}`, params),
      db.query(
        `SELECT c.*, s.name as school_name, s.slug as school_slug
         FROM school_claims c
         JOIN schools s ON s.id = c.school_id
         ${where}
         ORDER BY c.created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, limit, offset]
      ),
    ]);

    return NextResponse.json({
      claims: result.rows,
      total: countResult.rows[0].total,
      page,
      limit,
      total_pages: Math.ceil(countResult.rows[0].total / limit),
    });
  } catch (error) {
    console.error("Admin claims error:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}
