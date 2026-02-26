import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";

// GET /api/admin/schools — Paginated school list with search/filters
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const sp = request.nextUrl.searchParams;
  const search = sp.get("search");
  const type = sp.get("type");
  const rating = sp.get("rating");
  const area = sp.get("area");
  const verified = sp.get("verified");
  const hasFees = sp.get("has_fees");
  const sort = sp.get("sort") || "name";
  const order = sp.get("order") === "desc" ? "DESC" : "ASC";
  const page = Math.max(1, parseInt(sp.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "25")));
  const offset = (page - 1) * limit;

  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`(s.name ILIKE $${idx} OR s.area ILIKE $${idx} OR s.slug ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (type) {
      conditions.push(`s.type = $${idx++}`);
      params.push(type);
    }
    if (rating) {
      conditions.push(`s.khda_rating = $${idx++}`);
      params.push(rating);
    }
    if (area) {
      conditions.push(`s.area ILIKE $${idx++}`);
      params.push(`%${area}%`);
    }
    if (verified === "true") {
      conditions.push(`s.is_verified = true`);
    } else if (verified === "false") {
      conditions.push(`s.is_verified = false`);
    }
    if (hasFees === "true") {
      conditions.push(`(s.fee_min IS NOT NULL OR s.fee_max IS NOT NULL)`);
    } else if (hasFees === "false") {
      conditions.push(`s.fee_min IS NULL AND s.fee_max IS NULL`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const allowedSorts = ["name", "area", "khda_rating", "google_rating", "fee_min", "created_at", "updated_at"];
    const sortCol = allowedSorts.includes(sort) ? `s.${sort}` : "s.name";

    const [countResult, result] = await Promise.all([
      db.query(`SELECT COUNT(*)::int as total FROM schools s ${where}`, params),
      db.query(
        `SELECT s.id, s.slug, s.name, s.type, s.area, s.curriculum,
                s.khda_rating, s.google_rating, s.google_review_count,
                s.fee_min, s.fee_max,
                s.is_active, s.is_verified, s.is_featured,
                s.has_sen_support,
                s.ai_summary IS NOT NULL as has_summary,
                s.google_place_id IS NOT NULL as has_google,
                s.email IS NOT NULL as has_email,
                s.google_photos IS NOT NULL as has_photos,
                (s.fee_min IS NOT NULL OR s.fee_max IS NOT NULL) as has_fees,
                s.created_at, s.updated_at
         FROM schools s
         ${where}
         ORDER BY ${sortCol} ${order}
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, limit, offset]
      ),
    ]);

    return NextResponse.json({
      schools: result.rows,
      total: countResult.rows[0].total,
      page,
      limit,
      total_pages: Math.ceil(countResult.rows[0].total / limit),
    });
  } catch (error) {
    console.error("Admin schools error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}
