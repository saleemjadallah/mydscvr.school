import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { cosineSimilarity } from "@/lib/vectors";

// GET /api/schools/:slug/similar — AI-powered similar schools
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Get target school's embedding
    const school = await db.query(
      `SELECT se.embedding
       FROM schools s
       JOIN school_embeddings se ON se.school_id = s.id
       WHERE s.slug = $1`,
      [slug]
    );

    if (!school.rows[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const targetEmb = school.rows[0].embedding as number[];

    // Fetch all other active schools with embeddings
    const others = await db.query(
      `SELECT s.id, s.slug, s.name, s.khda_rating, s.fee_min, s.fee_max,
              s.area, s.curriculum, s.google_rating, s.google_photos, s.ai_summary,
              se.embedding
       FROM schools s
       JOIN school_embeddings se ON se.school_id = s.id
       WHERE s.slug != $1 AND s.is_active = true`,
      [slug]
    );

    // Compute similarity and rank
    const ranked = others.rows
      .map((row: Record<string, unknown>) => {
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
