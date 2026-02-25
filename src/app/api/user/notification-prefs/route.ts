import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";

// GET /api/user/notification-prefs — Get notification preferences
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userResult = await db.query(
      `SELECT id FROM users WHERE clerk_id = $1`,
      [userId]
    );
    if (!userResult.rows[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const internalUserId = userResult.rows[0].id;

    // Upsert to ensure defaults exist
    const result = await db.query(
      `INSERT INTO user_notification_prefs (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [internalUserId]
    );

    return NextResponse.json({ prefs: result.rows[0] });
  } catch (error) {
    console.error("Get notification prefs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

// PUT /api/user/notification-prefs — Update notification preferences
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      enquiry_no_response_days,
      email_enquiry_updates,
      email_school_news,
      email_weekly_digest,
    } = body;

    const userResult = await db.query(
      `SELECT id FROM users WHERE clerk_id = $1`,
      [userId]
    );
    if (!userResult.rows[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const internalUserId = userResult.rows[0].id;

    const result = await db.query(
      `INSERT INTO user_notification_prefs (
         user_id, enquiry_no_response_days, email_enquiry_updates,
         email_school_news, email_weekly_digest
       ) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         enquiry_no_response_days = COALESCE($2, user_notification_prefs.enquiry_no_response_days),
         email_enquiry_updates = COALESCE($3, user_notification_prefs.email_enquiry_updates),
         email_school_news = COALESCE($4, user_notification_prefs.email_school_news),
         email_weekly_digest = COALESCE($5, user_notification_prefs.email_weekly_digest),
         updated_at = NOW()
       RETURNING *`,
      [
        internalUserId,
        enquiry_no_response_days ?? 7,
        email_enquiry_updates ?? true,
        email_school_news ?? false,
        email_weekly_digest ?? false,
      ]
    );

    return NextResponse.json({ prefs: result.rows[0] });
  } catch (error) {
    console.error("Update notification prefs error:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
