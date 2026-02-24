import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import db from "@/db";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { cache } from "@/lib/cache";
import { sanitizeSchoolRecords } from "@/lib/school-data";
import { formatFeeRange } from "@/lib/school-utils";
import type { CompareSchool } from "@/types";

let _claude: Anthropic | null = null;
function getClaude() {
  return (_claude ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));
}

const SCHOOL_COLUMNS = `
  id, slug, name, type, area, curriculum, phases, gender,
  khda_rating, fee_min, fee_max, google_rating, google_review_count,
  has_sen_support, phases, ai_summary
`;

function sortedKey(ids: string[]): string {
  return [...ids].sort().join(",");
}

function hashQuery(q: string): string {
  let h = 0;
  for (let i = 0; i < q.length; i++) {
    h = ((h << 5) - h + q.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

// GET /api/compare/stream?schools=id1,id2&query=optional
export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  // Share rate limit key with main compare endpoint
  const rl = rateLimit(`compare:${ip}`, { limit: 10, windowSeconds: 60 });
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many comparisons. Please wait a moment." }),
      { status: 429, headers: { "Retry-After": String(rl.resetIn), "Content-Type": "application/json" } }
    );
  }

  const params = request.nextUrl.searchParams;
  const schoolParam = params.get("schools");
  const query = params.get("query") || undefined;

  if (!schoolParam) {
    return new Response(
      JSON.stringify({ error: "Missing schools parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const schoolIds = schoolParam.split(",").filter(Boolean);
  if (schoolIds.length < 2) {
    return new Response(
      JSON.stringify({ error: "Provide at least 2 school IDs" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const cacheKey = sortedKey(schoolIds);
  const aiCacheKey = query
    ? `compare:ai:${cacheKey}:${hashQuery(query)}`
    : `compare:ai:${cacheKey}`;

  // ── Check AI cache first ──
  const cachedAI = await cache.get<string>(aiCacheKey);
  if (cachedAI) {
    // Send cached text as a single event
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", text: cachedAI })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // ── Fetch school data for prompt ──
  const schoolResult = await db.query(
    `SELECT ${SCHOOL_COLUMNS} FROM schools WHERE id = ANY($1)`,
    [schoolIds]
  );

  if (schoolResult.rows.length < 2) {
    return new Response(
      JSON.stringify({ error: "Schools not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const schools = sanitizeSchoolRecords(
    schoolResult.rows
  ) as unknown as CompareSchool[];

  // ── Stream from Anthropic ──
  const encoder = new TextEncoder();
  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = getClaude().messages.stream({
          model: "claude-sonnet-4-5-20241022",
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

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const delta = event.delta.text;
            fullText += delta;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", text: delta })}\n\n`
              )
            );
          }
        }

        // Cache completed text
        await cache.set(aiCacheKey, fullText, query ? 900 : 1800);

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
        controller.close();
      } catch (error) {
        console.error("Stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "Stream failed" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
