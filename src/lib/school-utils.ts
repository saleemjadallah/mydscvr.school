import { KHDA_NUMERIC, FACILITY_FEATURES } from "./constants";

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
// Photo resolver — pick best available photo
// ---------------------------------------------------------------------------

export function resolvePhoto(
  photos: string[] | null | undefined,
  index = 0
): string | null {
  if (!photos || photos.length === 0) return null;
  return photos[Math.min(index, photos.length - 1)] ?? null;
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
