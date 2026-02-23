import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import db from "@/db";

// GET /api/user — Get current user profile + preferences
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clerkUser = await currentUser();

    // Upsert user with Clerk data
    const result = await db.query(
      `INSERT INTO users (clerk_id, email, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (clerk_id) DO UPDATE SET
         email = COALESCE($2, users.email),
         name = COALESCE($3, users.name),
         updated_at = NOW()
       RETURNING *`,
      [
        userId,
        clerkUser?.emailAddresses?.[0]?.emailAddress ?? userId,
        clerkUser?.firstName
          ? `${clerkUser.firstName}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ""}`
          : null,
      ]
    );

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// PUT /api/user — Update user profile + preferences
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      phone,
      nationality,
      current_area,
      children_count,
      preferred_curricula,
      preferred_areas,
      budget_min,
      budget_max,
    } = body;

    const result = await db.query(
      `UPDATE users SET
        phone = COALESCE($2, phone),
        nationality = COALESCE($3, nationality),
        current_area = COALESCE($4, current_area),
        children_count = COALESCE($5, children_count),
        preferred_curricula = $6,
        preferred_areas = $7,
        budget_min = $8,
        budget_max = $9,
        updated_at = NOW()
       WHERE clerk_id = $1
       RETURNING *`,
      [
        userId,
        phone || null,
        nationality || null,
        current_area || null,
        children_count || null,
        preferred_curricula || null,
        preferred_areas || null,
        budget_min || null,
        budget_max || null,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
