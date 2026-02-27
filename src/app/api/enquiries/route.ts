import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db";
import { sendEnquiryEmail } from "@/lib/email";
import { processEnquiryBilling } from "@/lib/billing";

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
    enquiry_type,
  } = body;

  // Validate required fields
  if (!school_id || !parent_name || !parent_email) {
    return NextResponse.json(
      { error: "Missing required fields: school_id, parent_name, parent_email" },
      { status: 400 }
    );
  }

  const client = await db.getClient();

  try {
    // Get school details (outside transaction — read-only)
    const school = await client.query("SELECT * FROM schools WHERE id = $1", [
      school_id,
    ]);
    if (!school.rows[0]) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // Check if user is authenticated to link the enquiry
    let internalUserId: string | null = null;
    try {
      const { userId } = await auth();
      if (userId) {
        const userResult = await client.query(
          `SELECT id FROM users WHERE clerk_id = $1`,
          [userId]
        );
        if (userResult.rows[0]) {
          internalUserId = userResult.rows[0].id;
        }
      }
    } catch {
      // Not authenticated — continue without user_id
    }

    // BEGIN transaction: enquiry insert + billing
    await client.query("BEGIN");

    // Insert enquiry
    const result = await client.query(
      `
      INSERT INTO enquiries (
        school_id, parent_name, parent_email, parent_phone, parent_whatsapp,
        child_name, child_dob, child_grade, child_year, message, preferred_start,
        siblings, source, search_query, utm_source, utm_medium, utm_campaign, user_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
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
        internalUserId,
      ]
    );

    const enquiryId = result.rows[0].id;

    // Process billing within the same transaction
    const billing = await processEnquiryBilling(
      client,
      enquiryId,
      school_id,
      parent_email
    );

    // Update enquiry with billing info
    await client.query(
      `UPDATE enquiries
       SET is_billed = $2, billed_at = CASE WHEN $2 THEN NOW() ELSE NULL END, billed_amount = $3
       WHERE id = $1`,
      [enquiryId, billing.is_billed, billing.billed_amount]
    );

    await client.query("COMMIT");

    // Emails sent OUTSIDE the transaction (fire-and-forget)
    sendEnquiryEmail({
      type: "parent_confirmation",
      to: parent_email,
      parentName: parent_name,
      schoolName: school.rows[0].name,
      enquiryId,
    }).catch((err) => console.error("Parent email error:", err));

    if (school.rows[0].admission_email) {
      sendEnquiryEmail({
        type: "school_notification",
        to: school.rows[0].admission_email,
        parentName: parent_name,
        parentEmail: parent_email,
        parentPhone: parent_phone,
        schoolName: school.rows[0].name,
        childGrade: child_grade,
        message,
        enquiryId,
        enquiryType: enquiry_type,
      }).catch((err) => console.error("School email error:", err));

      db.query(
        `UPDATE enquiries SET status = 'sent_to_school', sent_to_school_at = NOW() WHERE id = $1`,
        [enquiryId]
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      enquiry_id: enquiryId,
      message: "Your enquiry has been submitted successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Enquiry error:", error);
    return NextResponse.json(
      { error: "Failed to submit enquiry" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
