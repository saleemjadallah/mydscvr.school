import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { cache } from "@/lib/cache";

// GET /api/schools — List with filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");
  const area = searchParams.get("area");
  const curriculum = searchParams.get("curriculum");
  const rating = searchParams.get("rating");
  const fee_min = searchParams.get("fee_min");
  const fee_max = searchParams.get("fee_max");
  const has_sen = searchParams.get("has_sen");
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  const sort = searchParams.get("sort") || "rating";

  const cacheKey = `schools:list:${searchParams.toString()}`;
  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT
      s.*,
      COUNT(e.id) as enquiry_count_30d
    FROM schools s
    LEFT JOIN enquiries e ON e.school_id = s.id
      AND e.created_at > NOW() - INTERVAL '30 days'
    WHERE s.is_active = true
  `;
  const params: unknown[] = [];
  let paramIdx = 1;

  if (type) {
    query += ` AND s.type = $${paramIdx++}`;
    params.push(type);
  }
  if (area) {
    query += ` AND s.area ILIKE $${paramIdx++}`;
    params.push(`%${area}%`);
  }
  if (curriculum) {
    query += ` AND $${paramIdx++} = ANY(s.curriculum)`;
    params.push(curriculum);
  }
  if (rating) {
    query += ` AND s.khda_rating = $${paramIdx++}`;
    params.push(rating);
  }
  if (fee_min) {
    query += ` AND s.fee_max >= $${paramIdx++}`;
    params.push(parseInt(fee_min));
  }
  if (fee_max) {
    query += ` AND s.fee_min <= $${paramIdx++}`;
    params.push(parseInt(fee_max));
  }
  if (has_sen === "true") {
    query += ` AND s.has_sen_support = true`;
  }

  const sortMap: Record<string, string> = {
    rating: "s.khda_rating, s.google_rating DESC NULLS LAST",
    fee_asc: "s.fee_min ASC NULLS LAST",
    fee_desc: "s.fee_max DESC NULLS LAST",
    reviews: "s.google_review_count DESC NULLS LAST",
  };
  query += ` GROUP BY s.id ORDER BY ${sortMap[sort] || sortMap.rating}`;
  query += ` LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
  params.push(parseInt(limit), offset);

  try {
    const result = await db.query(query, params);

    const countQuery = `
      SELECT COUNT(*) FROM schools WHERE is_active = true
      ${type ? `AND type = '${type}'` : ""}
    `;
    const countResult = await db.query(countQuery);

    const response = {
      schools: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    };

    await cache.set(cacheKey, response, 300);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Schools list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}
