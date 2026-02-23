import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";

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

    return NextResponse.json({ schools: result.rows });
  } catch (error) {
    console.error("Saved schools list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved schools" },
      { status: 500 }
    );
  }
}

// POST /api/saved-schools — Save a school
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { schoolId } = await request.json();
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

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Save school error:", error);
    return NextResponse.json(
      { error: "Failed to save school" },
      { status: 500 }
    );
  }
}
