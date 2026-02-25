import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";
import { sanitizeTextValue } from "@/lib/school-data";
import { sendNoResponseReminderEmail } from "@/lib/email";

// GET /api/user/activity — Dashboard activity for current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get internal user id, email, and name
    const userResult = await db.query(
      `INSERT INTO users (clerk_id, email, name)
       VALUES ($1, $1, $1)
       ON CONFLICT (clerk_id) DO UPDATE SET updated_at = NOW()
       RETURNING id, email, name`,
      [userId]
    );
    const internalUserId = userResult.rows[0].id;
    const userEmail = userResult.rows[0].email;
    const userName = userResult.rows[0].name;

    // Get user's notification prefs (upsert defaults, then always SELECT)
    await db.query(
      `INSERT INTO user_notification_prefs (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [internalUserId]
    );
    const prefsResult = await db.query(
      `SELECT enquiry_no_response_days, email_enquiry_updates
       FROM user_notification_prefs WHERE user_id = $1`,
      [internalUserId]
    );
    const noResponseDays =
      prefsResult.rows[0]?.enquiry_no_response_days ?? 7;
    const emailEnquiryUpdates =
      prefsResult.rows[0]?.email_enquiry_updates ?? true;

    // Fetch all dashboard data in parallel
    const [savedCount, enquiries, recentSearches, statusCounts, unreadCount] =
      await Promise.all([
        // Saved schools count
        db.query(
          `SELECT COUNT(*) as count FROM saved_schools WHERE user_id = $1`,
          [internalUserId]
        ),

        // Recent enquiries with school names (last 20)
        db.query(
          `SELECT e.id, e.status, e.created_at, e.child_grade, e.message,
                  s.name as school_name, s.slug as school_slug, s.area as school_area,
                  s.khda_rating, s.google_photos,
                  (SELECT sp.r2_url FROM school_photos sp WHERE sp.school_id = s.id AND sp.is_active = true ORDER BY sp.sort_order LIMIT 1) as hero_photo_url,
                  EXTRACT(DAY FROM NOW() - e.created_at)::int as days_waiting
           FROM enquiries e
           JOIN schools s ON s.id = e.school_id
           WHERE e.user_id = $1 OR (e.parent_email = $2 AND e.user_id IS NULL)
           ORDER BY e.created_at DESC
           LIMIT 20`,
          [internalUserId, userEmail]
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

        // Enquiry status breakdown
        db.query(
          `SELECT status, COUNT(*) as count
           FROM enquiries
           WHERE user_id = $1 OR (parent_email = $2 AND user_id IS NULL)
           GROUP BY status`,
          [internalUserId, userEmail]
        ),

        // Unread notification count
        db.query(
          `SELECT COUNT(*) as count FROM enquiry_notifications
           WHERE user_id = $1 AND read_at IS NULL`,
          [internalUserId]
        ),
      ]);

    // Build status map + totals
    const byStatus: Record<string, number> = {};
    let totalEnquiries = 0;
    let responded = 0;
    for (const row of statusCounts.rows) {
      const count = parseInt(row.count);
      byStatus[row.status] = count;
      totalEnquiries += count;
      if (row.status === "responded" || row.status === "enrolled") {
        responded += count;
      }
    }

    // Detect no-response enquiries and create notifications
    const pendingNoResponse = enquiries.rows.filter(
      (e: Record<string, unknown>) =>
        (e.status === "new" || e.status === "sent_to_school") &&
        (e.days_waiting as number) >= noResponseDays
    );

    // Check which pending enquiries don't already have notifications
    if (pendingNoResponse.length > 0) {
      const pendingIds = pendingNoResponse.map(
        (e: Record<string, unknown>) => e.id
      );
      const existingNotifs = await db.query(
        `SELECT enquiry_id FROM enquiry_notifications
         WHERE enquiry_id = ANY($1) AND user_id = $2 AND type = 'no_response_reminder'`,
        [pendingIds, internalUserId]
      );
      const existingSet = new Set(
        existingNotifs.rows.map((r: Record<string, unknown>) => r.enquiry_id)
      );

      for (const enquiry of pendingNoResponse) {
        if (!existingSet.has(enquiry.id)) {
          const msg = `Your enquiry to ${enquiry.school_name} has been waiting ${enquiry.days_waiting} days with no response.`;
          await db.query(
            `INSERT INTO enquiry_notifications (enquiry_id, user_id, type, message, sent_at)
             VALUES ($1, $2, 'no_response_reminder', $3, NOW())`,
            [enquiry.id, internalUserId, msg]
          );

          // Send email reminder only if user has email_enquiry_updates enabled
          if (emailEnquiryUpdates) {
            sendNoResponseReminderEmail({
              to: userEmail,
              parentName: userName || "there",
              schoolName: enquiry.school_name as string,
              daysWaiting: enquiry.days_waiting as number,
              enquiryId: enquiry.id as string,
            }).catch((err: unknown) =>
              console.error("No-response email error:", err)
            );
          }
        }
      }
    }

    // Re-count unread after creating new notifications
    const updatedUnread = await db.query(
      `SELECT COUNT(*) as count FROM enquiry_notifications
       WHERE user_id = $1 AND read_at IS NULL`,
      [internalUserId]
    );

    const sanitizedEnquiries = enquiries.rows.flatMap(
      (row: Record<string, unknown>) => {
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
            hero_photo_url: row.hero_photo_url ?? null,
          },
        ];
      }
    );

    const sanitizedSearches = recentSearches.rows.flatMap(
      (row: Record<string, unknown>) => {
        const query = sanitizeTextValue(row.query);
        if (!query) return [];
        return [
          { ...row, query, query_type: sanitizeTextValue(row.query_type) },
        ];
      }
    );

    return NextResponse.json({
      saved_count: parseInt(savedCount.rows[0].count),
      enquiries: sanitizedEnquiries,
      recent_searches: sanitizedSearches,
      enquiry_stats: {
        total: totalEnquiries,
        by_status: byStatus,
        response_rate:
          totalEnquiries > 0
            ? parseFloat((responded / totalEnquiries).toFixed(2))
            : 0,
        pending_count: pendingNoResponse.length,
      },
      unread_notification_count: parseInt(updatedUnread.rows[0].count),
    });
  } catch (error) {
    console.error("User activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
