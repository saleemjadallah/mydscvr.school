import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";
import { searchDubaiEducationNews } from "@/lib/exa";
import type { ExaArticle } from "@/types";

const CACHE_KEY = "homepage:news";
const CACHE_TTL = 3600; // 1 hour

const QUERY_VARIATIONS = [
  "Dubai private schools education news",
  "Dubai KHDA schools inspection update",
  "Dubai school admissions fees",
];

export async function GET() {
  const cached = await cache.get<{ articles: ExaArticle[]; fetchedAt: string }>(
    CACHE_KEY
  );
  if (cached) return NextResponse.json(cached);

  try {
    // Rotate query based on current hour for content diversity
    const hourIndex = new Date().getUTCHours() % QUERY_VARIATIONS.length;
    const query = QUERY_VARIATIONS[hourIndex];

    const exaResult = await searchDubaiEducationNews(query, 8);

    const articles: ExaArticle[] = exaResult.results.map((r) => ({
      url: r.url,
      title: r.title ?? null,
      publishedDate: r.publishedDate ?? null,
      author: r.author ?? null,
      highlights: r.highlights ?? null,
      summary: null,
      source: new URL(r.url).hostname.replace(/^www\./, ""),
    }));

    const response = {
      articles,
      fetchedAt: new Date().toISOString(),
    };

    await cache.set(CACHE_KEY, response, CACHE_TTL);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Homepage news fetch error:", error);
    return NextResponse.json({ articles: [], fetchedAt: new Date().toISOString() });
  }
}
