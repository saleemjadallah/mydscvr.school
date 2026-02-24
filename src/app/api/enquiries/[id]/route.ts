import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { sanitizeTextValue } from "@/lib/school-data";

// GET /api/enquiries/:id — Get enquiry status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await db.query(
      `
      SELECT e.*, s.name as school_name
      FROM enquiries e
      JOIN schools s ON s.id = e.school_id
      WHERE e.id = $1
    `,
      [id]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const row = result.rows[0];
    return NextResponse.json({
      ...row,
      school_name: sanitizeTextValue(row.school_name) ?? row.school_name,
      child_grade: sanitizeTextValue(row.child_grade),
      message: sanitizeTextValue(row.message),
    });
  } catch (error) {
    console.error("Enquiry fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiry" },
      { status: 500 }
    );
  }
}
