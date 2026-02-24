// ---------------------------------------------------------------------------
// KHDA rating color map — single source of truth
// ---------------------------------------------------------------------------

export const KHDA_COLOR_MAP: Record<
  string,
  { bg: string; text: string; dot: string; hex: string }
> = {
  Outstanding: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    hex: "#10b981",
  },
  "Very Good": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
    hex: "#3b82f6",
  },
  Good: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
    hex: "#eab308",
  },
  Acceptable: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    dot: "bg-orange-500",
    hex: "#f97316",
  },
  Weak: {
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
    hex: "#ef4444",
  },
  "Very Weak": {
    bg: "bg-red-200",
    text: "text-red-800",
    dot: "bg-red-600",
    hex: "#dc2626",
  },
};

// Numeric score for radar chart (Outstanding=5 ... Weak=1, Very Weak=0.5)
export const KHDA_NUMERIC: Record<string, number> = {
  Outstanding: 5,
  "Very Good": 4,
  Good: 3,
  Acceptable: 2,
  Weak: 1,
  "Very Weak": 0.5,
};

// ---------------------------------------------------------------------------
// School comparison colors — one per school slot
// ---------------------------------------------------------------------------

export const SCHOOL_COLORS = [
  { name: "orange", hex: "#FF6B35", rgb: "255,107,53", tw: "text-[#FF6B35]" },
  { name: "purple", hex: "#A855F7", rgb: "168,85,247", tw: "text-purple-500" },
  { name: "teal", hex: "#0D9488", rgb: "13,148,136", tw: "text-teal-600" },
  { name: "amber", hex: "#F59E0B", rgb: "245,158,11", tw: "text-amber-500" },
] as const;

// ---------------------------------------------------------------------------
// Feature flag labels for facility grids
// ---------------------------------------------------------------------------

export const FACILITY_FEATURES = [
  { key: "has_sen_support", label: "SEN Support", icon: "Heart" },
  { key: "has_transport", label: "Transport", icon: "Bus" },
  { key: "has_swimming_pool", label: "Swimming Pool", icon: "Waves" },
  { key: "has_sports_facilities", label: "Sports Facilities", icon: "Dumbbell" },
  { key: "has_arts_program", label: "Arts Program", icon: "Palette" },
  { key: "has_after_school", label: "After School", icon: "Clock" },
  { key: "has_boarding", label: "Boarding", icon: "Building" },
] as const;

export type FacilityKey = (typeof FACILITY_FEATURES)[number]["key"];

// ---------------------------------------------------------------------------
// Radar chart axes
// ---------------------------------------------------------------------------

export const RADAR_AXES = [
  "KHDA Rating",
  "Google Rating",
  "Value for Money",
  "Facilities",
  "Reviews",
  "Breadth",
] as const;

// ---------------------------------------------------------------------------
// Max schools for comparison
// ---------------------------------------------------------------------------

export const MAX_COMPARE_SCHOOLS = 4;
