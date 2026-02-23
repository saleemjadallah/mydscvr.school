import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { sendEnquiryEmail } from "@/lib/email";

// POST /api/enquiries — Submit enquiry (core revenue action)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    school_id,
    parent_name,
    parent_email,
    parent_phone,
    parent_whatsapp,
    child_name,
    child_dob,
    child_grade,
    child_year,
    message,
    preferred_start,
    siblings,
    source,
    search_query,
    utm_source,
    utm_medium,
    utm_campaign,
  } = body;

  // Validate required fields
  if (!school_id || !parent_name || !parent_email) {
    return NextResponse.json(
      { error: "Missing required fields: school_id, parent_name, parent_email" },
      { status: 400 }
    );
  }

  try {
    // Get school details
    const school = await db.query("SELECT * FROM schools WHERE id = $1", [
      school_id,
    ]);
    if (!school.rows[0]) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // Insert enquiry
    const result = await db.query(
      `
      INSERT INTO enquiries (
        school_id, parent_name, parent_email, parent_phone, parent_whatsapp,
        child_name, child_dob, child_grade, child_year, message, preferred_start,
        siblings, source, search_query, utm_source, utm_medium, utm_campaign
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING id
    `,
      [
        school_id,
        parent_name,
        parent_email,
        parent_phone || null,
        parent_whatsapp || null,
        child_name || null,
        child_dob || null,
        child_grade || null,
        child_year || null,
        message || null,
        preferred_start || null,
        siblings || false,
        source || null,
        search_query || null,
        utm_source || null,
        utm_medium || null,
        utm_campaign || null,
      ]
    );

    const enquiryId = result.rows[0].id;

    // Send confirmation email to parent
    await sendEnquiryEmail({
      type: "parent_confirmation",
      to: parent_email,
      parentName: parent_name,
      schoolName: school.rows[0].name,
      enquiryId,
    }).catch((err) => console.error("Parent email error:", err));

    // Send lead notification email to school
    if (school.rows[0].admission_email) {
      await sendEnquiryEmail({
        type: "school_notification",
        to: school.rows[0].admission_email,
        parentName: parent_name,
        parentEmail: parent_email,
        parentPhone: parent_phone,
        childGrade: child_grade,
        message,
        enquiryId,
      }).catch((err) => console.error("School email error:", err));

      await db.query(
        `UPDATE enquiries SET status = 'sent_to_school', sent_to_school_at = NOW() WHERE id = $1`,
        [enquiryId]
      );
    }

    return NextResponse.json({
      success: true,
      enquiry_id: enquiryId,
      message: "Your enquiry has been submitted successfully",
    });
  } catch (error) {
    console.error("Enquiry error:", error);
    return NextResponse.json(
      { error: "Failed to submit enquiry" },
      { status: 500 }
    );
  }
}
