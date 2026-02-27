import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { cosineSimilarity } from "@/lib/vectors";
import { sanitizeSchoolRecord } from "@/lib/school-data";

// GET /api/schools/:slug/similar — AI-powered similar schools
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Get target school's embedding (scalar subquery avoids duplicates)
    const school = await db.query(
      `SELECT (SELECT se.embedding FROM school_embeddings se WHERE se.school_id = s.id ORDER BY se.created_at DESC LIMIT 1) as embedding
       FROM schools s
       WHERE s.slug = $1
         AND EXISTS (SELECT 1 FROM school_embeddings se WHERE se.school_id = s.id)`,
      [slug]
    );

    if (!school.rows[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const targetEmb = school.rows[0].embedding as number[];

    // Fetch all other active schools with embeddings (scalar subquery avoids duplicates)
    const others = await db.query(
      `SELECT s.id, s.slug, s.name, s.khda_rating, s.fee_min, s.fee_max,
              s.area, s.curriculum, s.google_rating, s.google_photos, s.ai_summary,
              (SELECT sp.r2_url FROM school_photos sp WHERE sp.school_id = s.id AND sp.is_active = true ORDER BY sp.sort_order LIMIT 1) as hero_photo_url,
              (SELECT se.embedding FROM school_embeddings se WHERE se.school_id = s.id ORDER BY se.created_at DESC LIMIT 1) as embedding
       FROM schools s
       WHERE s.slug != $1 AND s.is_active = true
         AND EXISTS (SELECT 1 FROM school_embeddings se WHERE se.school_id = s.id)`,
      [slug]
    );

    // Compute similarity and rank
    const ranked = others.rows
      .map((rawRow: Record<string, unknown>) => {
        const row = sanitizeSchoolRecord(rawRow);
        const emb = row.embedding as number[];
        const similarity = cosineSimilarity(targetEmb, emb);
        const out = { ...row };
        delete out.embedding;
        return { ...out, similarity };
      })
      .sort(
        (a: { similarity: number }, b: { similarity: number }) =>
          b.similarity - a.similarity
      )
      .slice(0, 5);

    return NextResponse.json(ranked);
  } catch (error) {
    console.error("Similar schools error:", error);
    return NextResponse.json(
      { error: "Failed to find similar schools" },
      { status: 500 }
    );
  }
}
