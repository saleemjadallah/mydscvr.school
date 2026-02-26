import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";

// GET /api/admin/users — Paginated user list with search + aggregation
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const sp = request.nextUrl.searchParams;
  const search = sp.get("search");
  const page = Math.max(1, parseInt(sp.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "25")));
  const offset = (page - 1) * limit;

  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`(u.name ILIKE $${idx} OR u.email ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [countResult, usersResult, signupsResult, prefStats] = await Promise.all([
      db.query(`SELECT COUNT(*)::int as total FROM users u ${where}`, params),

      db.query(
        `SELECT u.id, u.name, u.email, u.clerk_id, u.created_at,
                u.preferred_curricula, u.preferred_areas,
                u.budget_min, u.budget_max,
                (SELECT COUNT(*)::int FROM saved_schools ss WHERE ss.user_id = u.id) as saved_count,
                (SELECT COUNT(*)::int FROM enquiries e WHERE e.user_id = u.id) as enquiry_count
         FROM users u
         ${where}
         ORDER BY u.created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, limit, offset]
      ),

      // Signups over time (90 days)
      db.query(`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM users
        WHERE created_at > NOW() - INTERVAL '90 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),

      // Preference aggregations
      db.query(`
        SELECT
          UNNEST(preferred_curricula) as curriculum, COUNT(*)::int as count
        FROM users
        WHERE preferred_curricula IS NOT NULL AND array_length(preferred_curricula, 1) > 0
        GROUP BY curriculum
        ORDER BY count DESC
        LIMIT 10
      `),
    ]);

    return NextResponse.json({
      users: usersResult.rows,
      total: countResult.rows[0].total,
      page,
      limit,
      total_pages: Math.ceil(countResult.rows[0].total / limit),
      charts: {
        signups_over_time: signupsResult.rows.map((r: Record<string, unknown>) => ({
          date: new Date(r.date as string).toISOString().split("T")[0],
          count: r.count,
        })),
        curriculum_distribution: prefStats.rows,
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
