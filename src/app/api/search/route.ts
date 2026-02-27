import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import db from "@/db";
import { searchDubaiSchools } from "@/lib/exa";
import { cosineSimilarity } from "@/lib/vectors";
import { randomUUID } from "crypto";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeSchoolRecord } from "@/lib/school-data";
import { trackCAPISearch, getCookieValue } from "@/lib/meta-capi";
import { haversineDistance, distanceScore, geocodePlace, isInDubai, formatDistanceLabel } from "@/lib/geo";
import { resolveAreaAliases } from "@/lib/dubai-areas";
import { getSearchBoost } from "@/lib/featured";
import type { ExaArticle, User, LocationContext } from "@/types";

let _claude: Anthropic | null = null;
let _openai: OpenAI | null = null;
function getClaude() { return _claude ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }
function getOpenAI() { return _openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); }

function formatFeeRange(min: unknown, max: unknown): string {
  const minFee = typeof min === "number" ? min : null;
  const maxFee = typeof max === "number" ? max : null;
  if (minFee !== null && maxFee !== null) return `AED ${minFee.toLocaleString()}-${maxFee.toLocaleString()}/year`;
  if (minFee !== null) return `From AED ${minFee.toLocaleString()}/year`;
  if (maxFee !== null) return `Up to AED ${maxFee.toLocaleString()}/year`;
  return "Fees not published";
}

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

  const { query, session_id, filters, user_lat, user_lng, radius_km, meta_fbp, meta_fbc } = await request.json();

  if (!query || query.trim().length < 3) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  try {
    // Step 1: Extract structured intent from query using Claude Haiku
    let intent: Record<string, unknown> = { summary: query };
    try {
      const intentResponse = await getClaude().messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: `You extract structured search parameters from parent queries about Dubai and Abu Dhabi schools and nurseries.
Return ONLY valid JSON with these fields (all optional):
{
  "type": "school" | "nursery" | null,
  "curriculum": string[] | null,
  "areas": string[] | null,
  "emirate": "dubai" | "abu_dhabi" | null,
  "khda_rating": string | null,
  "fee_max_aed": number | null,
  "fee_min_aed": number | null,
  "has_sen": boolean | null,
  "gender": "mixed" | "boys" | "girls" | null,
  "phases": string[] | null,
  "features": string[] | null,
  "location_query": string | null,
  "near_me": boolean,
  "summary": string
}

Important distinctions:
- "emirate": Extract when user mentions Abu Dhabi, Al Ain, Al Dhafra, ADEK, or Abu Dhabi areas → "abu_dhabi". When user mentions Dubai or Dubai-specific areas → "dubai". Leave null if not specified.
- "areas": Use for well-known area names that directly match the database (e.g. "Mirdif", "Business Bay", "Khalifa City", "Al Ain").
- "location_query": Use for informal place names, landmarks, roads, or locations that need geocoding (e.g. "Al Qudra", "JBR", "near the mall", "Dubai Mall area"). This is for places that are NOT exact area names.
- "near_me": Set to true ONLY if the user explicitly says "near me", "nearby", "close to me", "around me", or similar phrases indicating they want results near their current location.
- "khda_rating": The rating field applies to both KHDA and ADEK inspection ratings (same scale: Outstanding, Very Good, Good, Acceptable, Weak).
- A query can have both "areas" AND "location_query" if appropriate, but typically it's one or the other.`,
        messages: [{ role: "user", content: query }],
      });

      intent = JSON.parse(
        intentResponse.content[0].type === "text"
          ? intentResponse.content[0].text
          : "{}"
      );
    } catch {
      // Non-fatal: fallback to basic intent if LLM parsing/generation fails.
      intent = { summary: query };
    }

    // Step 2: Generate embedding for semantic search
    let queryEmbedding: number[] | null = null;
    try {
      const embeddingResponse = await getOpenAI().embeddings.create({
        model: "text-embedding-3-small",
        input: query,
      });
      queryEmbedding = embeddingResponse.data[0].embedding;
    } catch (embeddingError) {
      // Non-fatal: continue with structured/filter ranking only.
      console.error("Embedding fallback (non-fatal):", embeddingError);
    }

    // Step 3: Hybrid search — semantic + structured filters
    const filterClauses = ["s.is_active = true"];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (intent.type) {
      filterClauses.push(`s.type = $${paramIdx++}`);
      params.push(intent.type);
    }
    if (intent.emirate) {
      filterClauses.push(`s.emirate = $${paramIdx++}`);
      params.push(intent.emirate);
    }
    if (intent.khda_rating) {
      // Rating applies to both KHDA and ADEK (same scale)
      if (intent.emirate === "abu_dhabi") {
        filterClauses.push(`s.adek_rating = $${paramIdx++}`);
      } else if (intent.emirate === "dubai") {
        filterClauses.push(`s.khda_rating = $${paramIdx++}`);
      } else {
        filterClauses.push(`(s.khda_rating = $${paramIdx} OR s.adek_rating = $${paramIdx})`);
        paramIdx++;
      }
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
      // Resolve aliases: "al barsha" → ["AL BARSHA FIRST", "AL BARSHA SECOND", ...]
      const resolvedAreas = (intent.areas as string[]).flatMap(resolveAreaAliases);
      filterClauses.push(`s.area ILIKE ANY($${paramIdx++})`);
      params.push(resolvedAreas.map((a) => `%${a}%`));
    }

    // Also resolve location_query through area aliases as a supplemental area filter
    if (intent.location_query && !(Array.isArray(intent.areas) && intent.areas.length)) {
      const locationAreas = resolveAreaAliases(intent.location_query as string);
      // Only add area filter if aliases resolved to something different
      if (locationAreas.length > 0 && locationAreas[0] !== intent.location_query) {
        filterClauses.push(`s.area ILIKE ANY($${paramIdx++})`);
        params.push(locationAreas.map((a) => `%${a}%`));
      }
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

    // Fetch filtered schools with their embeddings + subscription plan
    // Uses scalar subquery (not JOIN) to avoid duplicates if school_embeddings has multiple rows
    const searchResult = await db.query(
      `
      SELECT
        s.id, s.slug, s.name, s.type, s.area, s.curriculum, s.khda_rating,
        s.adek_rating, s.emirate, s.regulator,
        s.fee_min, s.fee_max, s.google_rating, s.google_review_count,
        s.ai_summary, s.ai_strengths, s.has_sen_support, s.latitude, s.longitude,
        s.google_photos, s.is_featured,
        ss.plan AS subscription_plan,
        (SELECT sp.r2_url FROM school_photos sp WHERE sp.school_id = s.id AND sp.is_active = true ORDER BY sp.sort_order LIMIT 1) as hero_photo_url,
        (SELECT se.embedding FROM school_embeddings se WHERE se.school_id = s.id ORDER BY se.created_at DESC LIMIT 1) as embedding
      FROM schools s
      LEFT JOIN school_subscriptions ss ON ss.school_id = s.id AND ss.status IN ('active', 'trialing')
      WHERE ${filterClauses.join(" AND ")}
        AND EXISTS (SELECT 1 FROM school_embeddings se WHERE se.school_id = s.id)
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

    // Resolve location context for distance ranking
    let referenceLocation: { lat: number; lng: number; source: string; placeName?: string } | null = null;
    let locationContext: LocationContext | undefined;

    if (intent.location_query) {
      // Geocode the place name
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (mapboxToken) {
        const geo = await geocodePlace(intent.location_query as string, mapboxToken);
        if (geo) {
          referenceLocation = { lat: geo.lat, lng: geo.lng, source: "geocoded", placeName: geo.placeName };
          locationContext = { type: "geocoded", lat: geo.lat, lng: geo.lng, place_name: geo.placeName };
        }
      }
    } else if (intent.near_me && typeof user_lat === "number" && typeof user_lng === "number") {
      if (isInDubai(user_lat, user_lng)) {
        referenceLocation = { lat: user_lat, lng: user_lng, source: "user_location" };
        locationContext = { type: "user_location", lat: user_lat, lng: user_lng };
      }
    } else if (typeof user_lat === "number" && typeof user_lng === "number") {
      // User passed coords (e.g. from Near Me button) even without "near me" in query
      if (isInDubai(user_lat, user_lng)) {
        referenceLocation = { lat: user_lat, lng: user_lng, source: "user_location" };
        locationContext = { type: "user_location", lat: user_lat, lng: user_lng };
      }
    }

    if (locationContext && typeof radius_km === "number") {
      locationContext.radius_km = radius_km;
    }

    // Compute cosine similarity and rank in application code
    const khdaScore: Record<string, number> = {
      Outstanding: 0.4,
      "Very Good": 0.3,
      Good: 0.2,
    };

    const scored = searchResult.rows.map(
      (rawRow: Record<string, unknown>) => {
        const row = sanitizeSchoolRecord(rawRow);
        const emb = row.embedding as number[];
        const semantic = queryEmbedding ? cosineSimilarity(queryEmbedding, emb) : 0;
        const inspectionRating = (row.khda_rating as string) || (row.adek_rating as string);
        const khda = khdaScore[inspectionRating] ?? 0.1;

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

        // Compute distance if we have a reference location and school has coords
        let schoolDistanceKm: number | null = null;
        let schoolDistScore = 0;
        if (referenceLocation && row.latitude != null && row.longitude != null) {
          schoolDistanceKm = haversineDistance(
            referenceLocation.lat,
            referenceLocation.lng,
            row.latitude as number,
            row.longitude as number
          );
          schoolDistScore = distanceScore(schoolDistanceKm);
        }

        // Ranking formula: adjust weights when location context is present
        const semanticWeight = referenceLocation ? 0.40 : 0.6;
        const distanceWeight = referenceLocation ? 0.35 : 0;

        // Plan-based search boost (supplements featured boost)
        const planBoost = getSearchBoost((row.subscription_plan as string) ?? "free");
        // Backward compat: manually featured schools (is_featured=true) keep strong boost
        const featuredBoost = row.is_featured ? 0.5 : 0;

        const hybridScore =
          semantic * semanticWeight +
          schoolDistScore * distanceWeight +
          khda +
          prefBoost +
          Math.max(planBoost, featuredBoost);

        // Strip raw embedding from response
        const school: Record<string, unknown> = { ...row };
        delete school.embedding;

        // Attach distance fields
        if (schoolDistanceKm !== null) {
          school.distance_km = Math.round(schoolDistanceKm * 10) / 10;
          school.distance_label = formatDistanceLabel(schoolDistanceKm);
        }

        return { ...school, semantic_score: semantic, hybridScore };
      }
    );

    // Apply radius filter if specified
    let filteredScored = scored;
    if (referenceLocation && typeof radius_km === "number" && radius_km > 0) {
      filteredScored = scored.filter(
        (s: Record<string, unknown>) =>
          s.distance_km == null || (s.distance_km as number) <= radius_km
      );
    }

    filteredScored.sort(
      (a: { hybridScore: number }, b: { hybridScore: number }) =>
        b.hybridScore - a.hybridScore
    );

    const topSchools = filteredScored.slice(0, 15).map(
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
      try {
        const distanceInfo = referenceLocation
          ? `\nLocation context: Results are ranked by proximity to ${referenceLocation.placeName ?? "the user's location"}.`
          : "";

        const explanationResponse = await getClaude().messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          system: `You are a helpful UAE school advisor for Dubai and Abu Dhabi. Given a parent's search query and top matching schools,
write a brief 2-3 sentence explanation of why these schools match their needs.
Be specific, warm, and honest. Mention school names. Don't be sycophantic.${distanceInfo ? " When location context is provided, mention the proximity to the searched location." : ""}`,
          messages: [
            {
              role: "user",
              content: `Parent query: "${query}"

Top matches:
${topResults
  .map(
    (s: Record<string, unknown>) =>
      `- ${s.name} (${s.area}): ${s.khda_rating ? `KHDA ${s.khda_rating}` : s.adek_rating ? `ADEK ${s.adek_rating}` : "Unrated"}, ${(s.curriculum as string[])?.join("/")}, ${formatFeeRange(s.fee_min, s.fee_max)}${s.distance_label ? `, ${s.distance_label}` : ""}`
  )
  .join("\n")}${distanceInfo}

Write your explanation:`,
            },
          ],
        });

        aiExplanation =
          explanationResponse.content[0].type === "text"
            ? explanationResponse.content[0].text
            : "";
      } catch (explanationError) {
        // Non-fatal: omit AI explanation if provider is unavailable.
        console.error("AI explanation fallback (non-fatal):", explanationError);
      }
    }

    // Log search for analytics (with structured intent for admin analytics)
    await db
      .query(
        `
      INSERT INTO search_logs (user_id, session_id, query, query_type, filters, results_count, structured_intent)
      VALUES ($1, $2, $3, 'natural_language', $4, $5, $6)
    `,
        [
          internalUserId,
          session_id || null,
          query,
          JSON.stringify(intent),
          topSchools.length,
          JSON.stringify(intent),
        ]
      )
      .catch(() => {});

    // Meta CAPI Search event (fire-and-forget, server generates event_id for client dedup)
    const meta_event_id = randomUUID();
    const cookieHeader = request.headers.get("cookie");
    trackCAPISearch({
      event_id: meta_event_id,
      event_source_url: request.headers.get("referer") || undefined,
      search_string: query,
      user: {
        ip: ip,
        user_agent: request.headers.get("user-agent"),
        fbp: meta_fbp || getCookieValue(cookieHeader, "_fbp"),
        fbc: meta_fbc || getCookieValue(cookieHeader, "_fbc"),
        external_id: internalUserId,
      },
    });

    return NextResponse.json({
      query,
      intent,
      schools: topSchools,
      ai_explanation: aiExplanation,
      total: topSchools.length,
      meta_event_id,
      ...(webResults && webResults.length > 0 ? { webResults } : {}),
      ...(locationContext ? { location_context: locationContext } : {}),
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
