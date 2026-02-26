import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";

// GET /api/admin/stats — Platform statistics
export async function GET() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  try {
    const [enquiries, schools, searches] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*) total,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') this_week,
          COUNT(*) FILTER (WHERE status = 'new') pending
        FROM enquiries
      `),
      db.query(
        `SELECT COUNT(*) total, COUNT(*) FILTER (WHERE is_featured) featured FROM schools`
      ),
      db.query(
        `SELECT COUNT(*) total FROM search_logs WHERE created_at > NOW() - INTERVAL '7 days'`
      ),
    ]);

    return NextResponse.json({
      enquiries: enquiries.rows[0],
      schools: schools.rows[0],
      searches_this_week: searches.rows[0].total,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
