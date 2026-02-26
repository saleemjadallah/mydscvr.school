import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/db";
import { cache } from "@/lib/cache";

// GET /api/admin/pipeline/health — Data coverage + pipeline health overview
export async function GET() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  try {
    const cacheKey = "admin:pipeline:health";
    const cached = await cache.get<Record<string, unknown>>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [lastRuns, coverage, dlqSummary, confidenceDistribution] = await Promise.all([
      // Last run per job
      db.query(`
        SELECT DISTINCT ON (job_name)
          job_name, status, started_at, completed_at,
          EXTRACT(EPOCH FROM (completed_at - started_at))::int as duration_seconds,
          metrics, error_message
        FROM pipeline_v2_runs
        ORDER BY job_name, started_at DESC
      `),

      // Data coverage
      db.query(`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE is_active)::int as active,
          COUNT(*) FILTER (WHERE fee_min IS NOT NULL OR fee_max IS NOT NULL)::int as with_fees,
          COUNT(*) FILTER (WHERE ai_summary IS NOT NULL)::int as with_summary,
          COUNT(*) FILTER (WHERE google_place_id IS NOT NULL)::int as with_google,
          COUNT(*) FILTER (WHERE is_verified)::int as verified,
          COUNT(*) FILTER (WHERE id IN (SELECT school_id FROM school_embeddings))::int as with_embeddings,
          COUNT(*) FILTER (WHERE email IS NOT NULL)::int as with_email,
          COUNT(*) FILTER (WHERE website IS NOT NULL)::int as with_website
        FROM schools
      `),

      // DLQ summary
      db.query(`
        SELECT COUNT(*)::int as total_unresolved
        FROM pipeline_v2_dlq
        WHERE resolved_at IS NULL
      `).catch(() => ({ rows: [{ total_unresolved: 0 }] })),

      // Source confidence distribution
      db.query(`
        SELECT source, AVG(confidence)::numeric(3,2) as avg_confidence, COUNT(*)::int as count
        FROM pipeline_v2_school_state
        GROUP BY source
        ORDER BY avg_confidence DESC
      `).catch(() => ({ rows: [] })),
    ]);

    const total = coverage.rows[0]?.total || 1;
    const cov = coverage.rows[0];

    const result = {
      last_runs: lastRuns.rows,
      coverage: {
        raw: cov,
        percentages: {
          fees: Math.round((cov.with_fees / total) * 100),
          summary: Math.round((cov.with_summary / total) * 100),
          google: Math.round((cov.with_google / total) * 100),
          verified: Math.round((cov.verified / total) * 100),
          embeddings: Math.round((cov.with_embeddings / total) * 100),
          email: Math.round((cov.with_email / total) * 100),
          website: Math.round((cov.with_website / total) * 100),
        },
      },
      dlq_unresolved: dlqSummary.rows[0]?.total_unresolved ?? 0,
      confidence_distribution: confidenceDistribution.rows,
    };

    await cache.set(cacheKey, result, 300);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin pipeline health error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipeline health" },
      { status: 500 }
    );
  }
}
