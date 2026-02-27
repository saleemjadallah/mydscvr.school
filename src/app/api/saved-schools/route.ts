import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";
import { sanitizeSchoolRecords } from "@/lib/school-data";
import { trackCAPIAddToWishlist, getCookieValue } from "@/lib/meta-capi";
import { getClientIP } from "@/lib/rate-limit";

// GET /api/saved-schools — List current user's saved schools
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Upsert user record from Clerk
    const userResult = await db.query(
      `INSERT INTO users (clerk_id, email, name)
       VALUES ($1, $1, $1)
       ON CONFLICT (clerk_id) DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [userId]
    );
    const internalUserId = userResult.rows[0].id;

    const result = await db.query(
      `SELECT s.*, ss.notes, ss.created_at as saved_at
       FROM saved_schools ss
       JOIN schools s ON s.id = ss.school_id
       WHERE ss.user_id = $1 AND s.is_active = true
       ORDER BY ss.created_at DESC`,
      [internalUserId]
    );

    return NextResponse.json({ schools: sanitizeSchoolRecords(result.rows) });
  } catch (error) {
    console.error("Saved schools list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved schools" },
      { status: 500 }
    );
  }
}

// POST /api/saved-schools — Save a school
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { schoolId, meta_event_id, meta_fbp, meta_fbc } = await request.json();
    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 }
      );
    }

    // Upsert user
    const userResult = await db.query(
      `INSERT INTO users (clerk_id, email, name)
       VALUES ($1, $1, $1)
       ON CONFLICT (clerk_id) DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [userId]
    );
    const internalUserId = userResult.rows[0].id;

    await db.query(
      `INSERT INTO saved_schools (user_id, school_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, school_id) DO NOTHING`,
      [internalUserId, schoolId]
    );

    // Meta CAPI AddToWishlist (fire-and-forget, dedup via meta_event_id)
    const cookieHeader = request.headers.get("cookie");
    trackCAPIAddToWishlist({
      event_id: meta_event_id,
      event_source_url: request.headers.get("referer") || undefined,
      user: {
        ip: getClientIP(request),
        user_agent: request.headers.get("user-agent"),
        fbp: meta_fbp || getCookieValue(cookieHeader, "_fbp"),
        fbc: meta_fbc || getCookieValue(cookieHeader, "_fbc"),
        external_id: internalUserId,
      },
      custom_data: {
        content_ids: [schoolId],
        content_type: "school",
      },
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Save school error:", error);
    return NextResponse.json(
      { error: "Failed to save school" },
      { status: 500 }
    );
  }
}
