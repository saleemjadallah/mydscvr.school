import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";

// GET /api/user/activity — Dashboard activity for current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get internal user id
    const userResult = await db.query(
      `INSERT INTO users (clerk_id, email, name)
       VALUES ($1, $1, $1)
       ON CONFLICT (clerk_id) DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [userId]
    );
    const internalUserId = userResult.rows[0].id;

    // Fetch all dashboard data in parallel
    const [savedCount, enquiries, recentSearches] = await Promise.all([
      // Saved schools count
      db.query(
        `SELECT COUNT(*) as count FROM saved_schools WHERE user_id = $1`,
        [internalUserId]
      ),

      // Recent enquiries with school names (last 20)
      db.query(
        `SELECT e.id, e.status, e.created_at, e.child_grade, e.message,
                s.name as school_name, s.slug as school_slug, s.area as school_area,
                s.khda_rating, s.google_photos
         FROM enquiries e
         JOIN schools s ON s.id = e.school_id
         WHERE e.parent_email = (SELECT email FROM users WHERE id = $1)
         ORDER BY e.created_at DESC
         LIMIT 20`,
        [internalUserId]
      ),

      // Recent search queries (last 10)
      db.query(
        `SELECT query, query_type, results_count, created_at
         FROM search_logs
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [internalUserId]
      ),
    ]);

    return NextResponse.json({
      saved_count: parseInt(savedCount.rows[0].count),
      enquiries: enquiries.rows,
      recent_searches: recentSearches.rows,
    });
  } catch (error) {
    console.error("User activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
