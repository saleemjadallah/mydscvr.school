import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import db from "@/db";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

let _claude: Anthropic | null = null;
function getClaude() { return _claude ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }

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
    // Build context about Dubai schools for Claude
    const schoolContext = await db.query(`
      SELECT name, area, curriculum, khda_rating, fee_min, fee_max, has_sen_support
      FROM schools WHERE is_active = true AND khda_rating IN ('Outstanding', 'Very Good')
      ORDER BY khda_rating, google_rating DESC NULLS LAST
      LIMIT 50
    `);

    const systemPrompt = `You are an expert Dubai school advisor for mydscvr.ai.
You help expat and local families find the perfect school or nursery in Dubai.

Current database includes ${schoolContext.rows.length} top-rated schools. Key facts:
- Dubai has 200+ private schools and 500+ nurseries
- All schools are rated by KHDA: Outstanding, Very Good, Good, Acceptable, Weak
- Fees range from ~AED 15,000/year (budget) to AED 130,000+/year (premium)
- Main curricula: British, American, IB, Indian (CBSE/ICSE), French, German, Japanese
- Key areas: JBR, Marina, Downtown, DIFC, Jumeirah, Mirdif, Arabian Ranches, Al Barsha

Available schools:
${schoolContext.rows
  .map(
    (s: Record<string, unknown>) =>
      `- ${s.name} (${s.area}): KHDA ${s.khda_rating}, ${(s.curriculum as string[])?.join("/")}, AED ${(s.fee_min as number)?.toLocaleString()}-${(s.fee_max as number)?.toLocaleString()}/yr${s.has_sen_support ? ", SEN support" : ""}`
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
