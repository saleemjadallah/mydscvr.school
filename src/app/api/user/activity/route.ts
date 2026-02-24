import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";
import { sanitizeTextValue } from "@/lib/school-data";

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

    const sanitizedEnquiries = enquiries.rows.flatMap((row: Record<string, unknown>) => {
      const schoolName = sanitizeTextValue(row.school_name);
      if (!schoolName) return [];

      const photos = Array.isArray(row.google_photos)
        ? row.google_photos.filter(
            (photo): photo is string =>
              typeof photo === "string" && photo.trim().length > 0
          )
        : null;

      return [
        {
          ...row,
          school_name: schoolName,
          school_area: sanitizeTextValue(row.school_area),
          khda_rating: sanitizeTextValue(row.khda_rating),
          child_grade: sanitizeTextValue(row.child_grade),
          message: sanitizeTextValue(row.message),
          google_photos: photos,
        },
      ];
    });

    const sanitizedSearches = recentSearches.rows.flatMap(
      (row: Record<string, unknown>) => {
        const query = sanitizeTextValue(row.query);
        if (!query) return [];
        return [{ ...row, query, query_type: sanitizeTextValue(row.query_type) }];
      }
    );

    return NextResponse.json({
      saved_count: parseInt(savedCount.rows[0].count),
      enquiries: sanitizedEnquiries,
      recent_searches: sanitizedSearches,
    });
  } catch (error) {
    console.error("User activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
