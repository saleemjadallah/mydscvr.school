import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";
import { searchDubaiEducationNews } from "@/lib/exa";
import type { ExaArticle } from "@/types";

const CACHE_KEY = "homepage:news";
const CACHE_TTL = 3600; // 1 hour
const EMPTY_CACHE_TTL = 300; // 5 min — retry sooner when no results

const QUERY_VARIATIONS = [
  "Dubai private schools education news",
  "Dubai KHDA schools inspection update",
  "Dubai school admissions fees",
  "UAE schools education news 2026",
];

// Broader fallback queries if primary returns nothing
const FALLBACK_QUERIES = [
  "Dubai schools education",
  "UAE education news",
  "Dubai KHDA school rating inspection",
];

// Static fallback articles when Exa is completely unavailable
const FALLBACK_ARTICLES: ExaArticle[] = [
  {
    url: "https://www.khda.gov.ae/en/DSIB/Reports",
    title: "KHDA School Inspection Reports — Latest Ratings",
    publishedDate: null,
    author: null,
    highlights: [
      "KHDA publishes annual inspection reports for all private schools in Dubai, rating them from Outstanding to Weak across key areas including student achievement, personal development, and leadership.",
    ],
    summary: null,
    source: "khda.gov.ae",
  },
  {
    url: "https://www.thenationalnews.com/uae/education/",
    title: "UAE Education — Latest News and Updates",
    publishedDate: null,
    author: null,
    highlights: [
      "Stay up to date with the latest UAE education news, including school admissions, fee changes, curriculum updates, and inspection results across Dubai and Abu Dhabi.",
    ],
    summary: null,
    source: "thenationalnews.com",
  },
  {
    url: "https://gulfnews.com/uae/education",
    title: "Gulf News Education — Dubai and UAE School Updates",
    publishedDate: null,
    author: null,
    highlights: [
      "Covering Dubai's private school landscape including admissions timelines, fee regulations, new school openings, and KHDA inspection results.",
    ],
    summary: null,
    source: "gulfnews.com",
  },
  {
    url: "https://www.khaleejtimes.com/education",
    title: "Khaleej Times Education — Schools and Universities",
    publishedDate: null,
    author: null,
    highlights: [
      "News and analysis on UAE education covering private schools, university admissions, scholarship opportunities, and regulatory updates from KHDA and ADEK.",
    ],
    summary: null,
    source: "khaleejtimes.com",
  },
];

function mapExaResults(results: { url: string; title?: string | null; publishedDate?: string | null; author?: string | null; highlights?: string[] | null }[]): ExaArticle[] {
  return results.map((r) => ({
    url: r.url,
    title: r.title ?? null,
    publishedDate: r.publishedDate ?? null,
    author: r.author ?? null,
    highlights: r.highlights ?? null,
    summary: null,
    source: new URL(r.url).hostname.replace(/^www\./, ""),
  }));
}

export async function GET() {
  const cached = await cache.get<{ articles: ExaArticle[]; fetchedAt: string }>(
    CACHE_KEY
  );
  if (cached && cached.articles.length > 0) return NextResponse.json(cached);

  try {
    // Rotate query based on current hour for content diversity
    const hourIndex = new Date().getUTCHours() % QUERY_VARIATIONS.length;
    const query = QUERY_VARIATIONS[hourIndex];

    // Try primary query with 90-day window
    let exaResult = await searchDubaiEducationNews(query, 8);
    let articles = mapExaResults(exaResult.results);

    // If primary returns too few, try fallback queries
    if (articles.length < 3) {
      for (const fallbackQuery of FALLBACK_QUERIES) {
        try {
          const fallbackResult = await searchDubaiEducationNews(fallbackQuery, 8);
          const fallbackArticles = mapExaResults(fallbackResult.results);
          // Deduplicate by URL
          const existingUrls = new Set(articles.map((a) => a.url));
          for (const a of fallbackArticles) {
            if (!existingUrls.has(a.url)) {
              articles.push(a);
              existingUrls.add(a.url);
            }
          }
          if (articles.length >= 6) break;
        } catch {
          // Continue to next fallback query
        }
      }
    }

    // If Exa returned nothing at all, use static fallback articles
    if (articles.length === 0) {
      articles = FALLBACK_ARTICLES;
    }

    const response = {
      articles,
      fetchedAt: new Date().toISOString(),
    };

    // Cache for shorter TTL if using fallback content
    const ttl = articles === FALLBACK_ARTICLES ? EMPTY_CACHE_TTL : CACHE_TTL;
    await cache.set(CACHE_KEY, response, ttl);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Homepage news fetch error:", error);
    // Return static fallback instead of empty array
    return NextResponse.json({
      articles: FALLBACK_ARTICLES,
      fetchedAt: new Date().toISOString(),
    });
  }
}
