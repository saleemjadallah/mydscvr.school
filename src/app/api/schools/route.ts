import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { cache } from "@/lib/cache";
import { sanitizeSchoolRecords } from "@/lib/school-data";
import { haversineDistance, formatDistanceLabel } from "@/lib/geo";

// GET /api/schools — List with filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim() || "";
  const type = searchParams.get("type");
  const area = searchParams.get("area");
  const curriculum = searchParams.get("curriculum");
  const rating = searchParams.get("rating");
  const emirate = searchParams.get("emirate");
  const fee_min = searchParams.get("fee_min");
  const fee_max = searchParams.get("fee_max");
  const has_sen = searchParams.get("has_sen");
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  const sort = searchParams.get("sort") || "rating";
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radiusKm = searchParams.get("radius_km");

  const cacheKey = `schools:list:${searchParams.toString()}`;
  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const offset = (parseInt(page) - 1) * parseInt(limit);

  // When text search is active, add a relevance score for sorting
  const hasTextSearch = q.length >= 2;
  const heroPhotoSubquery = `(SELECT sp.r2_url FROM school_photos sp WHERE sp.school_id = s.id AND sp.is_active = true ORDER BY sp.sort_order LIMIT 1) as hero_photo_url`;
  const selectClause = hasTextSearch
    ? `
      s.*,
      COUNT(e.id) as enquiry_count_30d,
      ${heroPhotoSubquery},
      CASE
        WHEN s.name ILIKE $1 THEN 100
        WHEN s.name ILIKE $2 THEN 80
        WHEN s.name ILIKE $3 THEN 60
        WHEN s.slug ILIKE $2 THEN 50
        WHEN s.area ILIKE $2 THEN 30
        WHEN array_to_string(s.curriculum, ' ') ILIKE $3 THEN 20
        ELSE 10
      END as search_relevance
    `
    : `
      s.*,
      COUNT(e.id) as enquiry_count_30d,
      ${heroPhotoSubquery}
    `;

  let query = `
    SELECT ${selectClause}
    FROM schools s
    LEFT JOIN enquiries e ON e.school_id = s.id
      AND e.created_at > NOW() - INTERVAL '30 days'
    WHERE s.is_active = true
  `;
  const params: unknown[] = [];
  let paramIdx = 1;

  if (hasTextSearch) {
    // $1 = exact name, $2 = starts with, $3 = contains
    params.push(q, `${q}%`, `%${q}%`);
    paramIdx = 4;

    // Split query into words for multi-word matching (e.g. "dubai british" finds "Dubai British School")
    const words = q.split(/\s+/).filter((w) => w.length >= 2);
    if (words.length > 1) {
      // Each word must appear somewhere in name, area, slug, or curriculum
      const wordClauses = words.map((word) => {
        const p = paramIdx++;
        params.push(`%${word}%`);
        return `(s.name ILIKE $${p} OR s.area ILIKE $${p} OR s.slug ILIKE $${p} OR array_to_string(s.curriculum, ' ') ILIKE $${p})`;
      });
      query += ` AND (
        (s.name ILIKE $3 OR s.slug ILIKE $3 OR s.area ILIKE $3 OR array_to_string(s.curriculum, ' ') ILIKE $3)
        OR (${wordClauses.join(" AND ")})
      )`;
    } else {
      query += ` AND (s.name ILIKE $3 OR s.slug ILIKE $3 OR s.area ILIKE $3 OR array_to_string(s.curriculum, ' ') ILIKE $3)`;
    }
  }

  if (type) {
    query += ` AND s.type = $${paramIdx++}`;
    params.push(type);
  }
  if (emirate) {
    query += ` AND s.emirate = $${paramIdx++}`;
    params.push(emirate);
  }
  if (area) {
    query += ` AND s.area ILIKE $${paramIdx++}`;
    params.push(`%${area}%`);
  }
  if (curriculum) {
    query += ` AND $${paramIdx++} = ANY(s.curriculum)`;
    params.push(curriculum);
  }
  if (rating) {
    if (emirate === "abu_dhabi") {
      query += ` AND s.adek_rating = $${paramIdx++}`;
    } else if (emirate === "dubai") {
      query += ` AND s.khda_rating = $${paramIdx++}`;
    } else {
      query += ` AND (s.khda_rating = $${paramIdx} OR s.adek_rating = $${paramIdx})`;
      paramIdx++;
    }
    params.push(rating);
  }
  if (fee_min) {
    query += ` AND s.fee_max >= $${paramIdx++}`;
    params.push(parseInt(fee_min));
  }
  if (fee_max) {
    query += ` AND s.fee_min <= $${paramIdx++}`;
    params.push(parseInt(fee_max));
  }
  if (has_sen === "true") {
    query += ` AND s.has_sen_support = true`;
  }

  const sortMap: Record<string, string> = {
    rating: "COALESCE(s.khda_rating, s.adek_rating) NULLS LAST, s.google_rating DESC NULLS LAST",
    fee_asc: "s.fee_min ASC NULLS LAST",
    fee_desc: "s.fee_max DESC NULLS LAST",
    reviews: "s.google_review_count DESC NULLS LAST",
  };
  // When searching by text, sort by relevance first
  const orderBy = hasTextSearch
    ? `search_relevance DESC, s.google_rating DESC NULLS LAST`
    : sortMap[sort] || sortMap.rating;
  query += ` GROUP BY s.id ORDER BY ${orderBy}`;
  query += ` LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
  params.push(parseInt(limit), offset);

  try {
    const result = await db.query(query, params);

    // Build count query with the same filters (minus LIMIT/OFFSET)
    let countQuery = `SELECT COUNT(*) FROM schools s WHERE s.is_active = true`;
    const countParams: unknown[] = [];
    let countIdx = 1;

    if (hasTextSearch) {
      countParams.push(`%${q}%`);
      const cqContains = `$${countIdx++}`;

      const words = q.split(/\s+/).filter((w) => w.length >= 2);
      if (words.length > 1) {
        const wordClauses = words.map((word) => {
          const p = countIdx++;
          countParams.push(`%${word}%`);
          return `(s.name ILIKE $${p} OR s.area ILIKE $${p} OR s.slug ILIKE $${p} OR array_to_string(s.curriculum, ' ') ILIKE $${p})`;
        });
        countQuery += ` AND (
          (s.name ILIKE ${cqContains} OR s.slug ILIKE ${cqContains} OR s.area ILIKE ${cqContains} OR array_to_string(s.curriculum, ' ') ILIKE ${cqContains})
          OR (${wordClauses.join(" AND ")})
        )`;
      } else {
        countQuery += ` AND (s.name ILIKE ${cqContains} OR s.slug ILIKE ${cqContains} OR s.area ILIKE ${cqContains} OR array_to_string(s.curriculum, ' ') ILIKE ${cqContains})`;
      }
    }
    if (type) {
      countQuery += ` AND s.type = $${countIdx++}`;
      countParams.push(type);
    }
    if (emirate) {
      countQuery += ` AND s.emirate = $${countIdx++}`;
      countParams.push(emirate);
    }
    if (area) {
      countQuery += ` AND s.area ILIKE $${countIdx++}`;
      countParams.push(`%${area}%`);
    }
    if (curriculum) {
      countQuery += ` AND $${countIdx++} = ANY(s.curriculum)`;
      countParams.push(curriculum);
    }
    if (rating) {
      if (emirate === "abu_dhabi") {
        countQuery += ` AND s.adek_rating = $${countIdx++}`;
      } else if (emirate === "dubai") {
        countQuery += ` AND s.khda_rating = $${countIdx++}`;
      } else {
        countQuery += ` AND (s.khda_rating = $${countIdx} OR s.adek_rating = $${countIdx})`;
        countIdx++;
      }
      countParams.push(rating);
    }
    if (fee_min) {
      countQuery += ` AND s.fee_max >= $${countIdx++}`;
      countParams.push(parseInt(fee_min));
    }
    if (fee_max) {
      countQuery += ` AND s.fee_min <= $${countIdx++}`;
      countParams.push(parseInt(fee_max));
    }
    if (has_sen === "true") {
      countQuery += ` AND s.has_sen_support = true`;
    }

    const countResult = await db.query(countQuery, countParams);

    let schools = sanitizeSchoolRecords(result.rows).map((s: Record<string, unknown>) => {
      const out = { ...s };
      delete out.search_relevance;
      return out;
    });

    // Compute distances if lat/lng provided
    const hasLocation = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
    if (hasLocation) {
      const refLat = parseFloat(lat!);
      const refLng = parseFloat(lng!);
      const radiusLimit = radiusKm ? parseFloat(radiusKm) : null;

      schools = schools.map((s: Record<string, unknown>) => {
        if (s.latitude != null && s.longitude != null) {
          const dist = haversineDistance(refLat, refLng, s.latitude as number, s.longitude as number);
          return {
            ...s,
            distance_km: Math.round(dist * 10) / 10,
            distance_label: formatDistanceLabel(dist),
          };
        }
        return s;
      });

      // Filter by radius if specified
      if (radiusLimit && radiusLimit > 0) {
        schools = schools.filter(
          (s: Record<string, unknown>) =>
            s.distance_km == null || (s.distance_km as number) <= radiusLimit
        );
      }

      // Sort by distance if requested
      if (sort === "distance") {
        schools.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
          const aDist = a.distance_km as number | undefined;
          const bDist = b.distance_km as number | undefined;
          if (aDist == null && bDist == null) return 0;
          if (aDist == null) return 1;
          if (bDist == null) return -1;
          return aDist - bDist;
        });
      }
    }

    const response = {
      schools,
      total: hasLocation && radiusKm ? schools.length : parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    };

    // Only cache when no location params (location-based results are personal)
    if (!hasLocation) {
      await cache.set(cacheKey, response, 300);
    }
    return NextResponse.json(response);
  } catch (error) {
    console.error("Schools list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}
