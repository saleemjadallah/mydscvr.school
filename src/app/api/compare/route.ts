import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import db from "@/db";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { cache } from "@/lib/cache";
import { sanitizeSchoolRecords } from "@/lib/school-data";
import { formatFeeRange } from "@/lib/school-utils";
import type {
  CompareSchool,
  CompareResponse,
  FeeHistoryEntry,
  KHDAReportSummary,
  ReviewSummary,
} from "@/types";

let _claude: Anthropic | null = null;
function getClaude() {
  return (_claude ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));
}

// Selected columns for comparison (not SELECT *)
const SCHOOL_COLUMNS = `
  id, slug, name, type, area, address,
  curriculum, phases, gender,
  khda_rating, khda_rating_year,
  fee_min, fee_max, fee_currency,
  google_rating, google_review_count, google_photos,
  website, latitude, longitude, total_students,
  has_sen_support, has_transport, has_boarding,
  has_after_school, has_sports_facilities, has_swimming_pool, has_arts_program,
  ai_summary, ai_strengths, ai_considerations, description
`;

/** Sort IDs to create a canonical cache key */
function sortedKey(ids: string[]): string {
  return [...ids].sort().join(",");
}

/** Simple hash for query strings */
function hashQuery(q: string): string {
  let h = 0;
  for (let i = 0; i < q.length; i++) {
    h = ((h << 5) - h + q.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

// POST /api/compare — AI-powered school comparison
export async function POST(request: NextRequest) {
  // Rate limit: 10 comparisons per minute per IP (Sonnet is expensive)
  const ip = getClientIP(request);
  const rl = rateLimit(`compare:${ip}`, { limit: 10, windowSeconds: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many comparisons. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rl.resetIn) } }
    );
  }

  const body = await request.json();
  const { school_ids, school_slugs, query } = body;

  // Accept either IDs or slugs
  const hasIds = Array.isArray(school_ids) && school_ids.length >= 2;
  const hasSlugs = Array.isArray(school_slugs) && school_slugs.length >= 2;

  if (!hasIds && !hasSlugs) {
    return NextResponse.json(
      { error: "Provide at least 2 school IDs or slugs to compare" },
      { status: 400 }
    );
  }

  try {
    // ── Resolve school IDs from slugs if needed ──
    let resolvedIds: string[];

    if (hasIds) {
      resolvedIds = school_ids;
    } else {
      const slugResult = await db.query(
        `SELECT id FROM schools WHERE slug = ANY($1) AND is_active = true`,
        [school_slugs]
      );
      resolvedIds = slugResult.rows.map((r: { id: string }) => r.id);
      if (resolvedIds.length < 2) {
        return NextResponse.json(
          { error: "Could not find enough schools matching those slugs" },
          { status: 404 }
        );
      }
    }

    const cacheKey = sortedKey(resolvedIds);

    // ── Check school data cache ──
    const cachedData = await cache.get<CompareResponse>(
      `compare:data:${cacheKey}`
    );
    if (cachedData) {
      // Still need to handle AI comparison (may be separate cache)
      const aiCacheKey = query
        ? `compare:ai:${cacheKey}:${hashQuery(query)}`
        : `compare:ai:${cacheKey}`;
      const cachedAI = await cache.get<string>(aiCacheKey);
      if (cachedAI) {
        return NextResponse.json({ ...cachedData, ai_comparison: cachedAI });
      }

      // Generate AI comparison for cached data
      const aiText = await generateAIComparison(cachedData.schools, query);
      await cache.set(aiCacheKey, aiText, query ? 900 : 1800);
      return NextResponse.json({ ...cachedData, ai_comparison: aiText });
    }

    // ── Run all 4 queries in parallel ──
    const [schoolResult, feeResult, khdaResult, reviewResult] =
      await Promise.all([
        // Query A: School data (lean columns)
        db.query(`SELECT ${SCHOOL_COLUMNS} FROM schools WHERE id = ANY($1)`, [
          resolvedIds,
        ]),
        // Query B: Fee history
        db.query(
          `SELECT school_id, year, grade, fee_aed, source
           FROM fee_history WHERE school_id = ANY($1)
           ORDER BY year DESC, grade`,
          [resolvedIds]
        ),
        // Query C: KHDA reports
        db.query(
          `SELECT school_id, year, rating, ai_summary, key_findings
           FROM khda_reports WHERE school_id = ANY($1)
           ORDER BY year DESC`,
          [resolvedIds]
        ),
        // Query D: Review summary (aggregated)
        db.query(
          `SELECT school_id,
                  COUNT(*)::int as total,
                  COUNT(*) FILTER (WHERE sentiment = 'positive')::int as positive,
                  COUNT(*) FILTER (WHERE sentiment = 'neutral')::int as neutral,
                  COUNT(*) FILTER (WHERE sentiment = 'negative')::int as negative,
                  ROUND(AVG(rating)::numeric, 1)::float as avg_rating
           FROM reviews WHERE school_id = ANY($1)
           GROUP BY school_id`,
          [resolvedIds]
        ),
      ]);

    if (schoolResult.rows.length === 0) {
      return NextResponse.json({ error: "Schools not found" }, { status: 404 });
    }

    const schools = sanitizeSchoolRecords(
      schoolResult.rows
    ) as unknown as CompareSchool[];

    // ── Shape supplementary data by school_id ──
    const feeHistory: Record<string, FeeHistoryEntry[]> = {};
    for (const row of feeResult.rows) {
      const sid = row.school_id as string;
      if (!feeHistory[sid]) feeHistory[sid] = [];
      feeHistory[sid].push({
        school_id: sid,
        year: row.year,
        grade: row.grade,
        fee_aed: row.fee_aed,
        source: row.source,
      });
    }

    const khdaReports: Record<string, KHDAReportSummary[]> = {};
    for (const row of khdaResult.rows) {
      const sid = row.school_id as string;
      if (!khdaReports[sid]) khdaReports[sid] = [];
      khdaReports[sid].push({
        school_id: sid,
        year: row.year,
        rating: row.rating,
        ai_summary: row.ai_summary,
        key_findings: row.key_findings,
      });
    }

    const reviewSummary: Record<string, ReviewSummary> = {};
    for (const row of reviewResult.rows) {
      reviewSummary[row.school_id as string] = {
        total: row.total,
        positive: row.positive,
        neutral: row.neutral,
        negative: row.negative,
        avg_rating: row.avg_rating,
      };
    }

    // ── Build response (without AI text — streamed separately or generated here) ──
    const response: CompareResponse = {
      schools,
      ai_comparison: null,
      fee_history: feeHistory,
      khda_reports: khdaReports,
      review_summary: reviewSummary,
    };

    // Cache school data + supplementary (10 min)
    await cache.set(`compare:data:${cacheKey}`, response, 600);

    // Generate AI comparison
    const aiCacheKey = query
      ? `compare:ai:${cacheKey}:${hashQuery(query)}`
      : `compare:ai:${cacheKey}`;
    const cachedAI = await cache.get<string>(aiCacheKey);

    if (cachedAI) {
      return NextResponse.json({ ...response, ai_comparison: cachedAI });
    }

    const aiText = await generateAIComparison(schools, query);
    await cache.set(aiCacheKey, aiText, query ? 900 : 1800);

    return NextResponse.json({ ...response, ai_comparison: aiText });
  } catch (error) {
    console.error("Compare error:", error);
    return NextResponse.json(
      { error: "Comparison failed" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// AI comparison generator
// ---------------------------------------------------------------------------

async function generateAIComparison(
  schools: CompareSchool[],
  query?: string
): Promise<string> {
  const comparison = await getClaude().messages.create({
    model: "claude-sonnet-4-5-20251022",
    max_tokens: 1500,
    system: `You are an expert Dubai school advisor. Compare the provided schools objectively and helpfully.
Structure your response as:
1. Quick Summary (2-3 sentences)
2. Strengths of each school
3. Key differences (fees, curriculum, location, facilities, KHDA rating)
4. Best for... (different family scenarios)
5. Questions to ask during school visits

Be honest, specific, and data-driven. Use the KHDA ratings and fee data provided.`,
    messages: [
      {
        role: "user",
        content: `${query ? `Parent's specific concern: ${query}\n\n` : ""}Compare these Dubai schools:\n\n${schools
          .map((s) =>
            JSON.stringify(
              {
                name: s.name,
                area: s.area,
                curriculum: s.curriculum,
                khda_rating: s.khda_rating,
                fees_aed: formatFeeRange(s.fee_min, s.fee_max),
                google_rating: s.google_rating,
                has_sen: s.has_sen_support,
                phases: s.phases,
                ai_summary: s.ai_summary,
              },
              null,
              2
            )
          )
          .join("\n\n")}`,
      },
    ],
  });

  return comparison.content[0].type === "text"
    ? comparison.content[0].text
    : "";
}
