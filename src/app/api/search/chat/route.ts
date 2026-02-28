import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import db from "@/db";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeSchoolRecords } from "@/lib/school-data";
import { cosineSimilarity } from "@/lib/vectors";
import { getSearchBoost } from "@/lib/featured";

let _claude: Anthropic | null = null;
let _openai: OpenAI | null = null;
function getClaude() { return _claude ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }
function getOpenAI() { return _openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); }

function formatFeeRange(min: unknown, max: unknown): string {
  const minFee = typeof min === "number" ? min : null;
  const maxFee = typeof max === "number" ? max : null;
  if (minFee !== null && maxFee !== null) {
    return `AED ${minFee.toLocaleString()}-${maxFee.toLocaleString()}/yr`;
  }
  if (minFee !== null) {
    return `From AED ${minFee.toLocaleString()}/yr`;
  }
  if (maxFee !== null) {
    return `Up to AED ${maxFee.toLocaleString()}/yr`;
  }
  return "Fees not published";
}

/**
 * For multi-turn conversations, synthesize a standalone search query
 * from recent messages so embedding search captures full context.
 */
async function buildSearchQuery(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content ?? "";

  // Single-turn: use the message directly
  if (messages.length <= 2) return lastMessage;

  // Multi-turn: synthesize from recent context
  try {
    const recent = messages.slice(-4);
    const response = await getClaude().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      system: `Given a conversation between a parent and a school advisor, synthesize the parent's current need into a single search query. Include all relevant context (curriculum, area, budget, age, features) mentioned across the conversation. Return ONLY the search query string, nothing else.`,
      messages: [
        {
          role: "user",
          content: recent
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n"),
        },
      ],
    });
    const synthesized =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";
    return synthesized || lastMessage;
  } catch {
    return lastMessage;
  }
}

/**
 * Embedding-based school search for chat context.
 * Mirrors the search route pattern: embed query → fetch all active schools
 * with embeddings → hybrid score → return top 20.
 */
async function searchSchoolsForChat(
  searchQuery: string
): Promise<Record<string, unknown>[]> {
  // Generate embedding for the search query
  const embeddingResponse = await getOpenAI().embeddings.create({
    model: "text-embedding-3-small",
    input: searchQuery,
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  // Fetch all active schools with embeddings (no rating filter)
  const result = await db.query(`
    SELECT
      s.name, s.area, s.curriculum, s.khda_rating, s.adek_rating,
      s.emirate, s.fee_min, s.fee_max, s.has_sen_support, s.is_featured,
      ss.plan AS subscription_plan,
      (SELECT se.embedding FROM school_embeddings se WHERE se.school_id = s.id ORDER BY se.created_at DESC LIMIT 1) as embedding
    FROM schools s
    LEFT JOIN school_subscriptions ss ON ss.school_id = s.id AND ss.status IN ('active', 'trialing')
    WHERE s.is_active = true
      AND EXISTS (SELECT 1 FROM school_embeddings se WHERE se.school_id = s.id)
  `);

  const khdaScore: Record<string, number> = {
    Outstanding: 0.4,
    "Very Good": 0.3,
    Good: 0.2,
    Acceptable: 0.1,
  };

  const scored = result.rows.map((row: Record<string, unknown>) => {
    const emb = row.embedding as number[];
    const semantic = cosineSimilarity(queryEmbedding, emb);
    const inspectionRating = (row.khda_rating as string) || (row.adek_rating as string);
    const khda = khdaScore[inspectionRating] ?? 0.05;

    const planBoost = getSearchBoost((row.subscription_plan as string) ?? "free");
    const featuredBoost = row.is_featured ? 0.5 : 0;

    const hybridScore = semantic * 0.6 + khda + Math.max(planBoost, featuredBoost);

    const school: Record<string, unknown> = { ...row };
    delete school.embedding;
    delete school.subscription_plan;
    delete school.is_featured;

    return { ...school, hybridScore };
  });

  scored.sort((a, b) => b.hybridScore - a.hybridScore);

  return scored.slice(0, 20).map(({ hybridScore: _, ...rest }) => rest);
}

/**
 * Fallback: static query for top-rated schools (used when embedding search fails).
 */
async function staticSchoolFallback(): Promise<Record<string, unknown>[]> {
  const result = await db.query(`
    SELECT name, area, curriculum, khda_rating, fee_min, fee_max, has_sen_support
    FROM schools WHERE is_active = true AND khda_rating IN ('Outstanding', 'Very Good')
    ORDER BY khda_rating, google_rating DESC NULLS LAST
    LIMIT 50
  `);
  return sanitizeSchoolRecords(result.rows).filter(
    (s: Record<string, unknown>) => typeof s.name === "string" && s.name.length > 0
  );
}

function formatRating(school: Record<string, unknown>): string {
  if (school.khda_rating && school.khda_rating !== "Not inspected yet") {
    return `KHDA ${school.khda_rating}`;
  }
  if (school.adek_rating && school.adek_rating !== "Not inspected yet") {
    return `ADEK ${school.adek_rating}`;
  }
  return "Not yet rated";
}

// POST /api/search/chat — Conversational AI search (multi-turn)
export async function POST(request: NextRequest) {
  // Rate limit: 30 chat messages per minute per IP
  const ip = getClientIP(request);
  const rl = rateLimit(`chat:${ip}`, { limit: 30, windowSeconds: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.resetIn) },
      }
    );
  }

  const { messages, session_id } = await request.json();

  try {
    // Build search query from conversation context, then find relevant schools
    let schoolContext: Record<string, unknown>[];
    try {
      const searchQuery = await buildSearchQuery(messages);
      schoolContext = await searchSchoolsForChat(searchQuery);
    } catch (searchError) {
      console.error("Embedding search fallback (non-fatal):", searchError);
      schoolContext = await staticSchoolFallback();
    }

    const sanitizedContext = sanitizeSchoolRecords(schoolContext).filter(
      (s: Record<string, unknown>) => typeof s.name === "string" && s.name.length > 0
    );

    const systemPrompt = `You are an expert UAE school advisor for mydscvr.ai.
You help expat and local families find the perfect school or nursery in Dubai and Abu Dhabi.

You have access to ${sanitizedContext.length} schools matched to the current conversation. Key facts:
- Dubai has 200+ private schools regulated by KHDA, Abu Dhabi schools are regulated by ADEK
- Inspection ratings: Outstanding, Very Good, Good, Acceptable, Weak — newer schools may not have a rating yet
- Fees range from ~AED 15,000/year (budget) to AED 130,000+/year (premium)
- Main curricula: British, American, IB, Indian (CBSE/ICSE), French, German, Japanese
- Key areas: JBR, Marina, Downtown, DIFC, Jumeirah, Mirdif, Arabian Ranches, Al Barsha, Khalifa City, Al Reem Island

Matched schools:
${sanitizedContext
  .map(
    (s: Record<string, unknown>) =>
      `- ${s.name} (${s.area}): ${formatRating(s)}, ${(s.curriculum as string[])?.join("/")}, ${formatFeeRange(s.fee_min, s.fee_max)}${s.has_sen_support ? ", SEN support" : ""}`
  )
  .join("\n")}

When you have enough information, suggest 2-3 specific schools by name with reasons.
Ask clarifying questions if needed: child's age/grade, preferred area, budget, curriculum preference, any special needs.
Always mention you can help them send an enquiry directly through mydscvr.ai.
Keep responses concise and practical.`;

    const response = await getClaude().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system: systemPrompt,
      messages: messages,
    });

    return NextResponse.json({
      message:
        response.content[0].type === "text" ? response.content[0].text : "",
      session_id,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
