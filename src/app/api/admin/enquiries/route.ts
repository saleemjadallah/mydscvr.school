import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";

// GET /api/admin/enquiries — All enquiries (leads)
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const school_id = searchParams.get("school_id");
  const limit = searchParams.get("limit") || "50";

  try {
    const result = await db.query(
      `
      SELECT e.*, s.name as school_name
      FROM enquiries e
      JOIN schools s ON s.id = e.school_id
      WHERE ($1::text IS NULL OR e.status = $1)
      AND ($2::uuid IS NULL OR e.school_id = $2)
      ORDER BY e.created_at DESC
      LIMIT $3
    `,
      [status || null, school_id || null, parseInt(limit)]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Admin enquiries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}
