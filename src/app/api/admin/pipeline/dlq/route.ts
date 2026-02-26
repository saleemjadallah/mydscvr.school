import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";

// GET /api/admin/pipeline/dlq — Dead letter queue items
export async function GET() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  try {
    const [items, summary] = await Promise.all([
      db.query(`
        SELECT d.*, s.name as school_name
        FROM pipeline_v2_dlq d
        LEFT JOIN schools s ON s.id = d.school_id
        WHERE d.resolved_at IS NULL
        ORDER BY d.attempts DESC, d.last_attempted_at DESC
        LIMIT 100
      `),

      db.query(`
        SELECT job_name, COUNT(*)::int as count, MAX(attempts)::int as max_attempts
        FROM pipeline_v2_dlq
        WHERE resolved_at IS NULL
        GROUP BY job_name
        ORDER BY count DESC
      `),
    ]);

    return NextResponse.json({
      items: items.rows,
      summary: summary.rows,
      total_unresolved: items.rows.length,
    });
  } catch (error) {
    console.error("Admin DLQ error:", error);
    return NextResponse.json(
      { error: "Failed to fetch DLQ data" },
      { status: 500 }
    );
  }
}
