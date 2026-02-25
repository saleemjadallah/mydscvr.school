import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";

// GET /api/user/notifications — List user's notifications (unread first)
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

    const result = await db.query(
      `SELECT n.*, s.name as school_name, s.slug as school_slug
       FROM enquiry_notifications n
       JOIN enquiries e ON e.id = n.enquiry_id
       JOIN schools s ON s.id = e.school_id
       WHERE n.user_id = $1
       ORDER BY n.read_at IS NULL DESC, n.created_at DESC
       LIMIT 50`,
      [internalUserId]
    );

    // Also get unread count
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM enquiry_notifications
       WHERE user_id = $1 AND read_at IS NULL`,
      [internalUserId]
    );

    return NextResponse.json({
      notifications: result.rows,
      unread_count: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
