import { NextRequest, NextResponse } from "next/server";
import db from "@/db";

// POST /api/claims — School claim submission
export async function POST(request: NextRequest) {
  const { school_id, contact_name, contact_email, contact_phone, role } =
    await request.json();

  if (!school_id || !contact_name || !contact_email) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const result = await db.query(
      `
      INSERT INTO school_claims (school_id, contact_name, contact_email, contact_phone, role)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `,
      [school_id, contact_name, contact_email, contact_phone || null, role || null]
    );

    return NextResponse.json({
      success: true,
      claim_id: result.rows[0].id,
      message: "Claim submitted. We will verify and contact you shortly.",
    });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { error: "Failed to submit claim" },
      { status: 500 }
    );
  }
}
