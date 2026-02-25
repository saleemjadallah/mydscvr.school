import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";

// PUT /api/user/notifications/[id] — Mark a notification as read
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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
      `UPDATE enquiry_notifications
       SET read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, internalUserId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ notification: result.rows[0] });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
