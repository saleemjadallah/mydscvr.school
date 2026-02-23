import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import db from "@/db";
import { searchDubaiSchools } from "@/lib/exa";
import type { ExaArticle } from "@/types";

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/search — Natural language AI search
export async function POST(request: NextRequest) {
  const { query, session_id, filters } = await request.json();

  if (!query || query.trim().length < 3) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  try {
    // Step 1: Extract structured intent from query using Claude Haiku
    const intentResponse = await claude.messages.create({
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
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Step 3: Hybrid search — semantic + structured filters
    const filterClauses = ["s.is_active = true"];
    const params: unknown[] = [JSON.stringify(queryEmbedding)];
    let paramIdx = 2;

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

    const searchResult = await db.query(
      `
      SELECT
        s.id, s.slug, s.name, s.type, s.area, s.curriculum, s.khda_rating,
        s.fee_min, s.fee_max, s.google_rating, s.google_review_count,
        s.ai_summary, s.ai_strengths, s.has_sen_support, s.latitude, s.longitude,
        s.google_photos, s.is_featured,
        1 - (se.embedding <=> $1::vector) as semantic_score
      FROM schools s
      JOIN school_embeddings se ON se.school_id = s.id
      WHERE ${filterClauses.join(" AND ")}
      ORDER BY
        s.is_featured DESC,
        (1 - (se.embedding <=> $1::vector)) * 0.6 +
        CASE s.khda_rating
          WHEN 'Outstanding' THEN 0.4
          WHEN 'Very Good' THEN 0.3
          WHEN 'Good' THEN 0.2
          ELSE 0.1
        END DESC
      LIMIT 15
    `,
      params
    );

    // Step 3b: Exa fallback when pgvector returns few results
    let webResults: ExaArticle[] | undefined;
    if (searchResult.rows.length < 3) {
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
    const topResults = searchResult.rows.slice(0, 5);
    let aiExplanation = "";

    if (topResults.length > 0) {
      const explanationResponse = await claude.messages.create({
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
      INSERT INTO search_logs (session_id, query, query_type, filters, results_count)
      VALUES ($1, $2, 'natural_language', $3, $4)
    `,
        [
          session_id || null,
          query,
          JSON.stringify(intent),
          searchResult.rows.length,
        ]
      )
      .catch(() => {});

    return NextResponse.json({
      query,
      intent,
      schools: searchResult.rows,
      ai_explanation: aiExplanation,
      total: searchResult.rows.length,
      ...(webResults && webResults.length > 0 ? { webResults } : {}),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
