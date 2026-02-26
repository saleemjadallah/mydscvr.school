import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";

// GET /api/admin/pipeline/runs — Pipeline job runs
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const limit = Math.min(100, parseInt(request.nextUrl.searchParams.get("limit") || "50"));
  const job = request.nextUrl.searchParams.get("job");

  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (job) {
      conditions.push(`job_name = $${idx++}`);
      params.push(job);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT id, job_name, status, started_at, completed_at,
              EXTRACT(EPOCH FROM (completed_at - started_at))::int as duration_seconds,
              metrics, error_message
       FROM pipeline_v2_runs
       ${where}
       ORDER BY started_at DESC
       LIMIT $${idx++}`,
      [...params, limit]
    );

    return NextResponse.json({ runs: result.rows });
  } catch (error) {
    console.error("Admin pipeline runs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipeline runs" },
      { status: 500 }
    );
  }
}
