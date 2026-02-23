import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";

// PATCH /api/admin/schools/:id — Update school
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const updates = await request.json();

  const allowedFields = [
    "is_featured",
    "is_active",
    "is_verified",
    "ai_summary",
    "khda_rating",
  ];

  const validUpdates = Object.entries(updates).filter(([k]) =>
    allowedFields.includes(k)
  );

  if (validUpdates.length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const setClauses = validUpdates.map(([k], i) => `${k} = $${i + 2}`).join(", ");
  const values = validUpdates.map(([, v]) => v);

  try {
    await db.query(
      `UPDATE schools SET ${setClauses}, updated_at = NOW() WHERE id = $1`,
      [id, ...values]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json(
      { error: "Failed to update school" },
      { status: 500 }
    );
  }
}
