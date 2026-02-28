import db from "@/db";
import { sanitizeSchoolRecords } from "@/lib/school-data";
import type { LandingPageConfig } from "@/content/landing-pages/types";
import type { School } from "@/types";

export interface LandingPageData {
  schools: School[];
  totalCount: number;
  avgFee: number | null;
  topRatedCount: number;
  totalReviews: number;
}

/**
 * Fetch filtered school data for a landing page config.
 * Direct DB queries — no API round-trip. Used by server components at build/ISR time.
 */
export async function fetchLandingPageData(
  config: LandingPageConfig
): Promise<LandingPageData> {
  const { filters } = config;

  // Build WHERE clauses
  const conditions: string[] = ["s.is_active = true"];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.emirate) {
    conditions.push(`s.emirate = $${idx++}`);
    params.push(filters.emirate);
  }

  if (filters.type) {
    conditions.push(`s.type = $${idx++}`);
    params.push(filters.type);
  }

  if (filters.curriculum) {
    conditions.push(`$${idx++} = ANY(s.curriculum)`);
    params.push(filters.curriculum);
  }

  if (filters.rating) {
    conditions.push(`(s.khda_rating = $${idx} OR s.adek_rating = $${idx})`);
    idx++;
    params.push(filters.rating);
  }

  if (filters.area) {
    conditions.push(`s.area ILIKE $${idx++}`);
    params.push(`%${filters.area}%`);
  }

  if (filters.feeMax) {
    conditions.push(`s.fee_min <= $${idx++}`);
    params.push(filters.feeMax);
  }

  if (filters.hasSen) {
    conditions.push(`s.has_sen_support = true`);
  }

  const whereClause = conditions.join(" AND ");

  // Query 1: fetch schools (limit 20, sorted by rating then Google rating)
  const heroPhotoSubquery = `(SELECT sp.r2_url FROM school_photos sp WHERE sp.school_id = s.id AND sp.is_active = true ORDER BY sp.sort_order LIMIT 1) as hero_photo_url`;
  const schoolsQuery = `
    SELECT s.*, ${heroPhotoSubquery}
    FROM schools s
    WHERE ${whereClause}
    ORDER BY
      CASE s.khda_rating
        WHEN 'Outstanding' THEN 1
        WHEN 'Very Good' THEN 2
        WHEN 'Good' THEN 3
        WHEN 'Acceptable' THEN 4
        WHEN 'Weak' THEN 5
        ELSE 6
      END,
      s.google_rating DESC NULLS LAST,
      s.google_review_count DESC NULLS LAST
    LIMIT 20
  `;

  // Query 2: aggregate stats
  const statsQuery = `
    SELECT
      COUNT(*)::int as total_count,
      ROUND(AVG(CASE WHEN s.fee_min IS NOT NULL AND s.fee_max IS NOT NULL
        THEN (s.fee_min + s.fee_max) / 2.0
        WHEN s.fee_min IS NOT NULL THEN s.fee_min
        WHEN s.fee_max IS NOT NULL THEN s.fee_max
        ELSE NULL END))::int as avg_fee,
      COUNT(*) FILTER (WHERE s.khda_rating IN ('Outstanding', 'Very Good') OR s.adek_rating IN ('Outstanding', 'Very Good'))::int as top_rated_count,
      COALESCE(SUM(s.google_review_count), 0)::int as total_reviews
    FROM schools s
    WHERE ${whereClause}
  `;

  const [schoolsResult, statsResult] = await Promise.all([
    db.query(schoolsQuery, params),
    db.query(statsQuery, params),
  ]);

  const schools = sanitizeSchoolRecords(schoolsResult.rows) as unknown as School[];
  const stats = statsResult.rows[0];

  return {
    schools,
    totalCount: stats.total_count ?? 0,
    avgFee: stats.avg_fee ?? null,
    topRatedCount: stats.top_rated_count ?? 0,
    totalReviews: stats.total_reviews ?? 0,
  };
}
