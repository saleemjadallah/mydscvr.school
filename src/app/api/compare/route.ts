import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import db from "@/db";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeSchoolRecords } from "@/lib/school-data";

let _claude: Anthropic | null = null;
function getClaude() { return _claude ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }

function formatFeeRange(min: unknown, max: unknown): string {
  const minFee = typeof min === "number" ? min : null;
  const maxFee = typeof max === "number" ? max : null;
  if (minFee !== null && maxFee !== null) return `AED ${minFee.toLocaleString()}-${maxFee.toLocaleString()}`;
  if (minFee !== null) return `From AED ${minFee.toLocaleString()}`;
  if (maxFee !== null) return `Up to AED ${maxFee.toLocaleString()}`;
  return "Fees not published";
}

// POST /api/compare — AI-powered school comparison
export async function POST(request: NextRequest) {
  // Rate limit: 10 comparisons per minute per IP (Sonnet is expensive)
  const ip = getClientIP(request);
  const rl = rateLimit(`compare:${ip}`, { limit: 10, windowSeconds: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many comparisons. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.resetIn) },
      }
    );
  }

  const { school_ids, query } = await request.json();

  if (!school_ids || school_ids.length < 2) {
    return NextResponse.json(
      { error: "Provide at least 2 school IDs to compare" },
      { status: 400 }
    );
  }

  try {
    const schools = await db.query(
      `
      SELECT s.*,
        json_agg(DISTINCT kr.*) FILTER (WHERE kr.id IS NOT NULL) as khda_reports,
        json_agg(DISTINCT fh.*) FILTER (WHERE fh.id IS NOT NULL) as fee_details
      FROM schools s
      LEFT JOIN khda_reports kr ON kr.school_id = s.id
      LEFT JOIN fee_history fh ON fh.school_id = s.id
      WHERE s.id = ANY($1)
      GROUP BY s.id
    `,
      [school_ids]
    );

    if (schools.rows.length === 0) {
      return NextResponse.json(
        { error: "Schools not found" },
        { status: 404 }
      );
    }

    const sanitizedSchools = sanitizeSchoolRecords(schools.rows);

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
          content: `${query ? `Parent's specific concern: ${query}\n\n` : ""}Compare these Dubai schools:\n\n${sanitizedSchools
            .map((s: Record<string, unknown>) =>
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

    return NextResponse.json({
      schools: sanitizedSchools,
      ai_comparison:
        comparison.content[0].type === "text"
          ? comparison.content[0].text
          : "",
    });
  } catch (error) {
    console.error("Compare error:", error);
    return NextResponse.json(
      { error: "Comparison failed" },
      { status: 500 }
    );
  }
}
