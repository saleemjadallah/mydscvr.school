import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import db from "@/db";
import { searchDubaiSchools } from "@/lib/exa";
import { cosineSimilarity } from "@/lib/vectors";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import type { ExaArticle, User } from "@/types";

let _claude: Anthropic | null = null;
let _openai: OpenAI | null = null;
function getClaude() { return _claude ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }
function getOpenAI() { return _openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); }

// POST /api/search — Natural language AI search
export async function POST(request: NextRequest) {
  // Rate limit: 20 searches per minute per IP
  const ip = getClientIP(request);
  const rl = rateLimit(`search:${ip}`, { limit: 20, windowSeconds: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many searches. Please wait a moment and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.resetIn) },
      }
    );
  }

  const { query, session_id, filters } = await request.json();

  if (!query || query.trim().length < 3) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  try {
    // Step 1: Extract structured intent from query using Claude Haiku
    const intentResponse = await getClaude().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: `You extract structured search parameters from parent queries about Dubai schools and nurseries.
Return ONLY valid JSON with these fields (all optional):
{
  "type": "school" | "nursery" | null,
  "curriculum": string[] | null,
  "areas": string[] | null,
  "khda_rating": string | null,
  "fee_max_aed": number | null,
  "fee_min_aed": number | null,
  "has_sen": boolean | null,
  "gender": "mixed" | "boys" | "girls" | null,
  "phases": string[] | null,
  "features": string[] | null,
  "summary": string
}`,
      messages: [{ role: "user", content: query }],
    });

    let intent: Record<string, unknown> = {};
    try {
      intent = JSON.parse(
        intentResponse.content[0].type === "text"
          ? intentResponse.content[0].text
          : "{}"
      );
    } catch {
      intent = { summary: query };
    }

    // Step 2: Generate embedding for semantic search
    const embeddingResponse = await getOpenAI().embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Step 3: Hybrid search — semantic + structured filters
    const filterClauses = ["s.is_active = true"];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (intent.type) {
      filterClauses.push(`s.type = $${paramIdx++}`);
      params.push(intent.type);
    }
    if (intent.khda_rating) {
      filterClauses.push(`s.khda_rating = $${paramIdx++}`);
      params.push(intent.khda_rating);
    }
    if (intent.fee_max_aed) {
      filterClauses.push(`s.fee_min <= $${paramIdx++}`);
      params.push(intent.fee_max_aed);
    }
    if (intent.fee_min_aed) {
      filterClauses.push(`s.fee_max >= $${paramIdx++}`);
      params.push(intent.fee_min_aed);
    }
    if (intent.has_sen) {
      filterClauses.push(`s.has_sen_support = true`);
    }
    if (intent.gender) {
      filterClauses.push(`s.gender = $${paramIdx++}`);
      params.push(intent.gender);
    }
    if (Array.isArray(intent.areas) && intent.areas.length) {
      filterClauses.push(`s.area ILIKE ANY($${paramIdx++})`);
      params.push((intent.areas as string[]).map((a) => `%${a}%`));
    }
    if (Array.isArray(intent.curriculum) && intent.curriculum.length) {
      filterClauses.push(`s.curriculum && $${paramIdx++}`);
      params.push(intent.curriculum);
    }

    // Apply additional manual filters
    if (filters?.type) {
      filterClauses.push(`s.type = $${paramIdx++}`);
      params.push(filters.type);
    }

    // Fetch filtered schools with their embeddings
    const searchResult = await db.query(
      `
      SELECT
        s.id, s.slug, s.name, s.type, s.area, s.curriculum, s.khda_rating,
        s.fee_min, s.fee_max, s.google_rating, s.google_review_count,
        s.ai_summary, s.ai_strengths, s.has_sen_support, s.latitude, s.longitude,
        s.google_photos, s.is_featured,
        se.embedding
      FROM schools s
      JOIN school_embeddings se ON se.school_id = s.id
      WHERE ${filterClauses.join(" AND ")}
    `,
      params
    );

    // Fetch user preferences for personalized ranking (non-blocking)
    let userPrefs: Partial<User> | null = null;
    let internalUserId: string | null = null;
    try {
      const { userId } = await auth();
      if (userId) {
        const userResult = await db.query(
          `SELECT id, preferred_curricula, preferred_areas, budget_min, budget_max
           FROM users WHERE clerk_id = $1`,
          [userId]
        );
        if (userResult.rows[0]) {
          internalUserId = userResult.rows[0].id;
          const u = userResult.rows[0];
          if (u.preferred_curricula || u.preferred_areas || u.budget_min || u.budget_max) {
            userPrefs = u;
          }
        }
      }
    } catch {
      // Auth check is optional — continue without preferences
    }

    // Compute cosine similarity and rank in application code
    const khdaScore: Record<string, number> = {
      Outstanding: 0.4,
      "Very Good": 0.3,
      Good: 0.2,
    };

    const scored = searchResult.rows.map(
      (row: Record<string, unknown>) => {
        const emb = row.embedding as number[];
        const semantic = cosineSimilarity(queryEmbedding, emb);
        const khda = khdaScore[row.khda_rating as string] ?? 0.1;

        // Preference-based soft boosts (small so they don't override relevance)
        let prefBoost = 0;
        if (userPrefs) {
          const schoolCurricula = (row.curriculum as string[]) ?? [];
          const schoolArea = row.area as string;
          const schoolFeeMin = row.fee_min as number | null;
          const schoolFeeMax = row.fee_max as number | null;

          // Curriculum match: +0.08 per matching curriculum
          if (userPrefs.preferred_curricula?.length) {
            const matches = schoolCurricula.filter((c) =>
              userPrefs!.preferred_curricula!.includes(c)
            ).length;
            prefBoost += matches * 0.08;
          }

          // Area match: +0.1 if school is in a preferred area
          if (userPrefs.preferred_areas?.length && schoolArea) {
            if (userPrefs.preferred_areas.includes(schoolArea)) {
              prefBoost += 0.1;
            }
          }

          // Budget match: +0.06 if school fees overlap with user budget
          if (userPrefs.budget_min || userPrefs.budget_max) {
            const budgetMin = userPrefs.budget_min ?? 0;
            const budgetMax = userPrefs.budget_max ?? Infinity;
            if (
              schoolFeeMin !== null &&
              schoolFeeMax !== null &&
              schoolFeeMin <= budgetMax &&
              schoolFeeMax >= budgetMin
            ) {
              prefBoost += 0.06;
            }
          }
        }

        const hybridScore =
          (row.is_featured ? 1000 : 0) + semantic * 0.6 + khda + prefBoost;
        // Strip raw embedding from response
        const school = { ...row };
        delete school.embedding;
        return { ...school, semantic_score: semantic, hybridScore };
      }
    );

    scored.sort(
      (a: { hybridScore: number }, b: { hybridScore: number }) =>
        b.hybridScore - a.hybridScore
    );

    const topSchools = scored.slice(0, 15).map(
      (s: Record<string, unknown>) => {
        const out = { ...s };
        delete out.hybridScore;
        return out;
      }
    );

    // Step 3b: Exa fallback when few results
    let webResults: ExaArticle[] | undefined;
    if (topSchools.length < 3) {
      try {
        const exaResult = await searchDubaiSchools(query);
        webResults = exaResult.results.map((r) => ({
          url: r.url,
          title: r.title ?? null,
          publishedDate: r.publishedDate ?? null,
          author: r.author ?? null,
          highlights: r.highlights ?? null,
          summary: null,
          source: new URL(r.url).hostname.replace(/^www\./, ""),
        }));
      } catch (exaError) {
        console.error("Exa fallback error (non-fatal):", exaError);
      }
    }

    // Step 4: Generate AI explanation of results
    const topResults = topSchools.slice(0, 5);
    let aiExplanation = "";

    if (topResults.length > 0) {
      const explanationResponse = await getClaude().messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: `You are a helpful Dubai school advisor. Given a parent's search query and top matching schools,
write a brief 2-3 sentence explanation of why these schools match their needs.
Be specific, warm, and honest. Mention school names. Don't be sycophantic.`,
        messages: [
          {
            role: "user",
            content: `Parent query: "${query}"

Top matches:
${topResults
  .map(
    (s: Record<string, unknown>) =>
      `- ${s.name} (${s.area}): KHDA ${s.khda_rating}, ${(s.curriculum as string[])?.join("/")}, AED ${(s.fee_min as number)?.toLocaleString()}-${(s.fee_max as number)?.toLocaleString()}/year`
  )
  .join("\n")}

Write your explanation:`,
          },
        ],
      });

      aiExplanation =
        explanationResponse.content[0].type === "text"
          ? explanationResponse.content[0].text
          : "";
    }

    // Log search for analytics
    await db
      .query(
        `
      INSERT INTO search_logs (user_id, session_id, query, query_type, filters, results_count)
      VALUES ($1, $2, $3, 'natural_language', $4, $5)
    `,
        [
          internalUserId,
          session_id || null,
          query,
          JSON.stringify(intent),
          topSchools.length,
        ]
      )
      .catch(() => {});

    return NextResponse.json({
      query,
      intent,
      schools: topSchools,
      ai_explanation: aiExplanation,
      total: topSchools.length,
      ...(webResults && webResults.length > 0 ? { webResults } : {}),
    });
  } catch (error) {
    console.error("Search error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Search failed", detail: message },
      { status: 500 }
    );
  }
}
