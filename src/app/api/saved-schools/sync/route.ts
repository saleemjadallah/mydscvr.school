import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";

// POST /api/saved-schools/sync — Bulk upsert localStorage saves to server
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { schoolIds } = await request.json();
    if (!Array.isArray(schoolIds) || schoolIds.length === 0) {
      return NextResponse.json({ synced: 0 });
    }

    // Cap at reasonable limit
    const ids = schoolIds.slice(0, 10);

    // Upsert user
    const userResult = await db.query(
      `INSERT INTO users (clerk_id, email, name)
       VALUES ($1, $1, $1)
       ON CONFLICT (clerk_id) DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [userId]
    );
    const internalUserId = userResult.rows[0].id;

    // Bulk insert — ON CONFLICT DO NOTHING prevents duplicates
    let synced = 0;
    for (const schoolId of ids) {
      if (typeof schoolId !== "string") continue;
      const result = await db.query(
        `INSERT INTO saved_schools (user_id, school_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, school_id) DO NOTHING`,
        [internalUserId, schoolId]
      );
      if (result.rowCount && result.rowCount > 0) synced++;
    }

    return NextResponse.json({ synced });
  } catch (error) {
    console.error("Saved schools sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync saved schools" },
      { status: 500 }
    );
  }
}
