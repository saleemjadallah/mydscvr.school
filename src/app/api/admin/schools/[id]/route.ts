import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin-auth";
import db from "@/db";

// GET /api/admin/schools/:id — Full school detail for admin
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const { id } = await params;

  try {
    const [school, fees, reviewsSummary, clickStats] = await Promise.all([
      db.query(`SELECT * FROM schools WHERE id = $1`, [id]),
      db.query(
        `SELECT grade, year, fee_aed, source
         FROM fee_history WHERE school_id = $1
         ORDER BY year DESC, grade`,
        [id]
      ),
      db.query(
        `SELECT COUNT(*)::int as total,
                AVG(rating)::numeric(2,1) as avg_rating,
                COUNT(*) FILTER (WHERE sentiment = 'positive')::int as positive,
                COUNT(*) FILTER (WHERE sentiment = 'negative')::int as negative,
                COUNT(*) FILTER (WHERE sentiment = 'neutral')::int as neutral
         FROM reviews WHERE school_id = $1`,
        [id]
      ),
      db.query(
        `SELECT COUNT(*)::int as total_clicks,
                COUNT(DISTINCT ip_address)::int as unique_visitors
         FROM outbound_clicks WHERE school_id = $1 AND created_at > NOW() - INTERVAL '30 days'`,
        [id]
      ),
    ]);

    if (school.rows.length === 0) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json({
      school: school.rows[0],
      fees: fees.rows,
      reviews_summary: reviewsSummary.rows[0],
      click_stats: clickStats.rows[0],
    });
  } catch (error) {
    console.error("Admin school detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch school" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/schools/:id — Update school (expanded fields + audit)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return adminCheck.response;

  const { id } = await params;
  const updates = await request.json();

  const allowedFields = [
    "is_featured", "is_active", "is_verified",
    "ai_summary", "ai_strengths", "ai_considerations",
    "khda_rating", "name", "area", "type", "gender",
    "description", "meta_description",
    "website", "email", "phone", "address",
    "fee_min", "fee_max",
    "has_sen_support", "has_bus_service", "has_boarding",
    "has_after_school", "has_scholarships", "has_gifted_program", "has_waiting_list",
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
    // Get current values for audit diff
    const fields = validUpdates.map(([k]) => k).join(", ");
    const before = await db.query(`SELECT ${fields} FROM schools WHERE id = $1`, [id]);

    await db.query(
      `UPDATE schools SET ${setClauses}, updated_at = NOW() WHERE id = $1`,
      [id, ...values]
    );

    // Audit log
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    await logAdminAction(db, {
      adminUserId: adminCheck.userId,
      action: "update_school",
      targetType: "school",
      targetId: id,
      changes: {
        before: before.rows[0] ?? {},
        after: Object.fromEntries(validUpdates),
      },
      ipAddress: ip,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json(
      { error: "Failed to update school" },
      { status: 500 }
    );
  }
}
