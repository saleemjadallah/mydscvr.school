import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { cache } from "@/lib/cache";
import { searchSchoolInsights } from "@/lib/exa";
import type { ExaArticle, SchoolInsightsResponse } from "@/types";

// GET /api/schools/:slug/insights — Web insights (reviews, blogs) about a school
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cacheKey = `school:${slug}:insights`;
  const cached = await cache.get<SchoolInsightsResponse>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // Look up school name and website from DB
    const result = await db.query(
      `SELECT name, website FROM schools WHERE slug = $1 AND is_active = true`,
      [slug]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const schoolName = result.rows[0].name as string;
    const website = result.rows[0].website as string | null;
    const exaResult = await searchSchoolInsights(schoolName, website);

    const insights: ExaArticle[] = exaResult.results.map((r) => ({
      url: r.url,
      title: r.title ?? null,
      publishedDate: r.publishedDate ?? null,
      author: r.author ?? null,
      highlights: r.highlights ?? null,
      summary: null,
      source: new URL(r.url).hostname.replace(/^www\./, ""),
    }));

    const response: SchoolInsightsResponse = {
      school: schoolName,
      insights,
      fetchedAt: new Date().toISOString(),
    };

    await cache.set(cacheKey, response, 3600);
    return NextResponse.json(response);
  } catch (error) {
    console.error("School insights fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch school insights" },
      { status: 500 }
    );
  }
}
