import { getPlanConfig } from "./plans";

/**
 * Deterministic featured scheduling based on school_id hash.
 * Growth: 1 day/week, Elite: 3 days/week, Enterprise: 7 days/week.
 */

function hashSchoolId(schoolId: string): number {
  let hash = 0;
  for (let i = 0; i < schoolId.length; i++) {
    const char = schoolId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return (hash & 0x7FFFFFFF);
}

/**
 * Check if a school should be featured today based on its plan.
 */
export function isSchoolFeaturedToday(
  schoolId: string,
  plan: string,
  date: Date = new Date()
): boolean {
  const config = getPlanConfig(plan);
  if (config.featuredDaysPerWeek === 0) return false;
  if (config.featuredDaysPerWeek >= 7) return true;

  const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
  const hash = hashSchoolId(schoolId);
  const baseDay = hash % 7;

  if (config.featuredDaysPerWeek === 1) {
    return dayOfWeek === baseDay;
  }

  if (config.featuredDaysPerWeek === 3) {
    // Spread 3 days evenly: base, base+2, base+5 (mod 7)
    const days = [baseDay, (baseDay + 2) % 7, (baseDay + 5) % 7];
    return days.includes(dayOfWeek);
  }

  // Fallback: hash-based for any number
  for (let i = 0; i < config.featuredDaysPerWeek; i++) {
    if (dayOfWeek === (baseDay + Math.floor((i * 7) / config.featuredDaysPerWeek)) % 7) {
      return true;
    }
  }

  return false;
}

/**
 * Get the search boost for a given plan.
 */
export function getSearchBoost(plan: string): number {
  return getPlanConfig(plan).searchBoost;
}
