import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";

// DELETE /api/saved-schools/:schoolId — Unsave a school
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { schoolId } = await params;

  try {
    const userResult = await db.query(
      `SELECT id FROM users WHERE clerk_id = $1`,
      [userId]
    );
    if (!userResult.rows[0]) {
      return NextResponse.json({ removed: true });
    }

    await db.query(
      `DELETE FROM saved_schools WHERE user_id = $1 AND school_id = $2`,
      [userResult.rows[0].id, schoolId]
    );

    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error("Unsave school error:", error);
    return NextResponse.json(
      { error: "Failed to unsave school" },
      { status: 500 }
    );
  }
}
