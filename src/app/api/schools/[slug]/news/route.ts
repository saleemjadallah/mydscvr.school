import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { cache } from "@/lib/cache";
import { searchSchoolNews } from "@/lib/exa";
import type { ExaArticle, SchoolNewsResponse } from "@/types";

// GET /api/schools/:slug/news — Recent news about a school
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cacheKey = `school:${slug}:news`;
  const cached = await cache.get<SchoolNewsResponse>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // Look up school name from DB
    const result = await db.query(
      `SELECT name FROM schools WHERE slug = $1 AND is_active = true`,
      [slug]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const schoolName = result.rows[0].name as string;
    const exaResult = await searchSchoolNews(schoolName);

    const articles: ExaArticle[] = exaResult.results.map((r) => ({
      url: r.url,
      title: r.title ?? null,
      publishedDate: r.publishedDate ?? null,
      author: r.author ?? null,
      highlights: r.highlights ?? null,
      summary: null,
      source: new URL(r.url).hostname.replace(/^www\./, ""),
    }));

    const response: SchoolNewsResponse = {
      school: schoolName,
      articles,
      fetchedAt: new Date().toISOString(),
    };

    await cache.set(cacheKey, response, 1800);
    return NextResponse.json(response);
  } catch (error) {
    console.error("School news fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch school news" },
      { status: 500 }
    );
  }
}
