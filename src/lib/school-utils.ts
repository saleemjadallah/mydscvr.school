import { KHDA_NUMERIC, FACILITY_FEATURES } from "./constants";
import type { SchoolPhoto } from "@/types";

// ---------------------------------------------------------------------------
// Fee formatting — single source of truth
// ---------------------------------------------------------------------------

export function formatFee(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function feeLabel(
  feeMin: number | null | undefined,
  feeMax: number | null | undefined
): string {
  if (feeMin != null && feeMax != null) {
    return `AED ${formatFee(feeMin)} – ${formatFee(feeMax)}`;
  }
  if (feeMin != null) return `From AED ${formatFee(feeMin)}`;
  if (feeMax != null) return `Up to AED ${formatFee(feeMax)}`;
  return "—";
}

export function formatFeeRange(
  min: unknown,
  max: unknown
): string {
  const minFee = typeof min === "number" ? min : null;
  const maxFee = typeof max === "number" ? max : null;
  if (minFee !== null && maxFee !== null)
    return `AED ${minFee.toLocaleString()}-${maxFee.toLocaleString()}`;
  if (minFee !== null) return `From AED ${minFee.toLocaleString()}`;
  if (maxFee !== null) return `Up to AED ${maxFee.toLocaleString()}`;
  return "Fees not published";
}

// ---------------------------------------------------------------------------
// Photo resolvers — centralized, R2-first with legacy fallback
// ---------------------------------------------------------------------------

/**
 * Check if a string looks like a real image URL (not a Google Places resource name).
 */
function isImageUrl(val: string): boolean {
  return val.startsWith("http://") || val.startsWith("https://");
}

/**
 * Parse legacy google_photos which may be a JSON string or array.
 * Only returns entries that look like actual URLs.
 */
function parseLegacyPhotos(raw: string[] | string | null | undefined): string[] {
  if (!raw) return [];
  let arr: string[];
  if (Array.isArray(raw)) {
    arr = raw;
  } else {
    try {
      const parsed = JSON.parse(raw);
      arr = Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return arr.filter(
    (p): p is string => typeof p === "string" && p.trim().length > 0 && isImageUrl(p)
  );
}

/**
 * Resolve all available photos for a school, R2-hosted first.
 * Priority: school_photos (R2) → legacy google_photos (only actual URLs) → empty.
 */
export function resolveSchoolPhotos(
  photos?: SchoolPhoto[] | null,
  legacyPhotos?: string[] | string | null,
): string[] {
  // Prefer R2-hosted photos
  if (photos && photos.length > 0) {
    return photos
      .filter((p) => p.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => p.r2_url);
  }
  // Fallback to legacy google_photos (only if they look like URLs)
  return parseLegacyPhotos(legacyPhotos);
}

/**
 * Resolve the hero (primary) photo for a school.
 * Accepts either structured photos or a pre-resolved hero_photo_url.
 */
export function resolveHeroPhoto(
  photos?: SchoolPhoto[] | null,
  legacyPhotos?: string[] | string | null,
  heroPhotoUrl?: string | null,
): string | null {
  // Direct hero URL (from subquery in list/search APIs)
  if (heroPhotoUrl && isImageUrl(heroPhotoUrl)) return heroPhotoUrl;
  // R2-hosted photos
  if (photos && photos.length > 0) {
    const hero = photos
      .filter((p) => p.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)[0];
    if (hero) return hero.r2_url;
  }
  // Legacy fallback
  const legacy = parseLegacyPhotos(legacyPhotos);
  return legacy[0] ?? null;
}

/**
 * @deprecated Use resolveHeroPhoto instead.
 * Kept for backward compatibility with compare components.
 */
export function resolvePhoto(
  photos: string[] | null | undefined,
  index = 0
): string | null {
  if (!photos || photos.length === 0) return null;
  const url = photos[Math.min(index, photos.length - 1)] ?? null;
  if (url && isImageUrl(url)) return url;
  return null;
}

// ---------------------------------------------------------------------------
// Facilities score (0-7) — count of boolean feature flags
// ---------------------------------------------------------------------------

export function facilitiesScore(school: Record<string, unknown>): number {
  return FACILITY_FEATURES.reduce((count, f) => {
    return count + (school[f.key] ? 1 : 0);
  }, 0);
}

// ---------------------------------------------------------------------------
// Radar chart data normalization (all values 0-5)
// ---------------------------------------------------------------------------

export function computeRadarValues(
  school: Record<string, unknown>,
  feeMaxGlobal: number
): number[] {
  // 1. KHDA Rating (Outstanding=5...Weak=1)
  const khdaScore =
    KHDA_NUMERIC[school.khda_rating as string] ?? 0;

  // 2. Google Rating (1-5, already on scale)
  const googleRating =
    typeof school.google_rating === "number"
      ? school.google_rating
      : 0;

  // 3. Value for Money (inverse normalized fee — cheaper = higher score)
  const feeMax =
    typeof school.fee_max === "number" ? school.fee_max : feeMaxGlobal;
  const valueScore =
    feeMaxGlobal > 0 ? 5 * (1 - feeMax / (feeMaxGlobal * 1.2)) : 2.5;

  // 4. Facilities Score (0-7 mapped to 0-5)
  const facilities = (facilitiesScore(school) / 7) * 5;

  // 5. Review Volume (normalized — cap at 500 reviews = 5)
  const reviewCount =
    typeof school.google_review_count === "number"
      ? school.google_review_count
      : 0;
  const reviewScore = Math.min(reviewCount / 100, 5);

  // 6. Curriculum Breadth (count of curricula + phases, capped at 5)
  const curricula = Array.isArray(school.curriculum)
    ? school.curriculum.length
    : 0;
  const phases = Array.isArray(school.phases) ? school.phases.length : 0;
  const breadth = Math.min(curricula + phases, 5);

  return [
    Math.max(0, Math.min(5, khdaScore)),
    Math.max(0, Math.min(5, googleRating)),
    Math.max(0, Math.min(5, valueScore)),
    Math.max(0, Math.min(5, facilities)),
    Math.max(0, Math.min(5, reviewScore)),
    Math.max(0, Math.min(5, breadth)),
  ];
}
