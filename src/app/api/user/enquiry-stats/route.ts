import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";

// GET /api/user/enquiry-stats — Aggregated enquiry statistics
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get internal user id + email
    const userResult = await db.query(
      `SELECT id, email FROM users WHERE clerk_id = $1`,
      [userId]
    );
    if (!userResult.rows[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { id: internalUserId, email } = userResult.rows[0];

    // Fetch all stats in parallel
    const [statusCounts, responseTimes, schoolCount, pending] =
      await Promise.all([
        // Status breakdown
        db.query(
          `SELECT status, COUNT(*) as count
           FROM enquiries
           WHERE user_id = $1 OR (parent_email = $2 AND user_id IS NULL)
           GROUP BY status`,
          [internalUserId, email]
        ),

        // Average response time (for enquiries that got a response)
        db.query(
          `SELECT AVG(EXTRACT(EPOCH FROM (responded_at - created_at)) / 86400) as avg_days
           FROM enquiries
           WHERE (user_id = $1 OR (parent_email = $2 AND user_id IS NULL))
             AND responded_at IS NOT NULL`,
          [internalUserId, email]
        ),

        // Distinct schools enquired
        db.query(
          `SELECT COUNT(DISTINCT school_id) as count
           FROM enquiries
           WHERE user_id = $1 OR (parent_email = $2 AND user_id IS NULL)`,
          [internalUserId, email]
        ),

        // Pending (no response) enquiries
        db.query(
          `SELECT e.id as enquiry_id, s.name as school_name, s.slug as school_slug,
                  EXTRACT(DAY FROM NOW() - e.created_at)::int as days_waiting
           FROM enquiries e
           JOIN schools s ON s.id = e.school_id
           WHERE (e.user_id = $1 OR (e.parent_email = $2 AND e.user_id IS NULL))
             AND e.status IN ('new', 'sent_to_school')
           ORDER BY e.created_at ASC`,
          [internalUserId, email]
        ),
      ]);

    // Build status map
    const byStatus: Record<string, number> = {};
    let total = 0;
    let responded = 0;
    for (const row of statusCounts.rows) {
      const count = parseInt(row.count);
      byStatus[row.status] = count;
      total += count;
      if (row.status === "responded" || row.status === "enrolled") {
        responded += count;
      }
    }

    const responseRate = total > 0 ? responded / total : 0;
    const avgResponseDays = responseTimes.rows[0]?.avg_days
      ? parseFloat(parseFloat(responseTimes.rows[0].avg_days).toFixed(1))
      : null;

    return NextResponse.json({
      total,
      by_status: byStatus,
      response_rate: parseFloat(responseRate.toFixed(2)),
      avg_response_days: avgResponseDays,
      schools_enquired: parseInt(schoolCount.rows[0].count),
      pending_no_response: pending.rows,
    });
  } catch (error) {
    console.error("Enquiry stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiry stats" },
      { status: 500 }
    );
  }
}
