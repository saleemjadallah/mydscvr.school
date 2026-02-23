import { NextRequest, NextResponse } from "next/server";
import db from "@/db";

// GET /api/schools/:slug/similar — AI-powered similar schools
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const school = await db.query(
      `SELECT se.embedding, s.area, s.curriculum, s.fee_min, s.fee_max
       FROM schools s
       JOIN school_embeddings se ON se.school_id = s.id
       WHERE s.slug = $1`,
      [slug]
    );

    if (!school.rows[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const similar = await db.query(
      `
      SELECT s.id, s.slug, s.name, s.khda_rating, s.fee_min, s.fee_max,
             s.area, s.curriculum, s.google_rating, s.google_photos, s.ai_summary,
             1 - (se.embedding <=> $1) as similarity
      FROM schools s
      JOIN school_embeddings se ON se.school_id = s.id
      WHERE s.slug != $2 AND s.is_active = true
      ORDER BY se.embedding <=> $1
      LIMIT 5
    `,
      [school.rows[0].embedding, slug]
    );

    return NextResponse.json(similar.rows);
  } catch (error) {
    console.error("Similar schools error:", error);
    return NextResponse.json(
      { error: "Failed to find similar schools" },
      { status: 500 }
    );
  }
}
