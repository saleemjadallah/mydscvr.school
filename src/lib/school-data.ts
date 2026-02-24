type SchoolRow = Record<string, unknown>;

const PLACEHOLDER_RE = /^(?:n\/a|na|tbd|coming soon|not available|unknown|null|none|-)$/i;

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function asCleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = normalizeSpaces(value);
  if (!clean) return null;
  if (PLACEHOLDER_RE.test(clean)) return null;
  return clean;
}

export function sanitizeTextValue(value: unknown): string | null {
  return asCleanString(value);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isTemplateSchoolCopy(value: string, schoolName: string | null): boolean {
  if (!schoolName) return false;
  const name = normalizeSpaces(schoolName);
  const text = normalizeSpaces(value);
  if (!name || !text) return false;

  const templatePattern = new RegExp(
    `^${escapeRegex(name)} is a (?:school|nursery) in .+(?: offering .+ curricula\\.)?$`,
    "i"
  );

  // The deterministic template generator always emits a single sentence ending in "."
  return templatePattern.test(text) && text.endsWith(".");
}

function isTemplateMetaDescription(value: string, schoolName: string | null): boolean {
  if (!schoolName) return false;
  const name = normalizeSpaces(schoolName);
  const text = normalizeSpaces(value);
  if (!name || !text) return false;

  const shortNameAreaPattern = new RegExp(`^${escapeRegex(name)} in .+$`, "i");
  return shortNameAreaPattern.test(text) && text.length <= 180;
}

function sanitizeSummaryLike(value: unknown, schoolName: string | null): string | null {
  const text = asCleanString(value);
  if (!text) return null;
  if (isTemplateSchoolCopy(text, schoolName)) return null;
  return text;
}

function sanitizeMetaDescription(value: unknown, schoolName: string | null): string | null {
  const text = asCleanString(value);
  if (!text) return null;
  if (isTemplateSchoolCopy(text, schoolName)) return null;
  if (isTemplateMetaDescription(text, schoolName)) return null;
  return text;
}

function sanitizeStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const cleaned = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => normalizeSpaces(item))
    .filter((item) => item.length > 0 && !PLACEHOLDER_RE.test(item));
  return cleaned.length > 0 ? cleaned : [];
}

export function sanitizeSchoolRecord<T extends SchoolRow>(row: T): T {
  const sanitized: SchoolRow = { ...row };
  const schoolName = asCleanString(row.name);

  sanitized.name = schoolName ?? row.name ?? null;
  sanitized.area = asCleanString(row.area);
  sanitized.khda_rating = asCleanString(row.khda_rating);
  sanitized.description = sanitizeSummaryLike(row.description, schoolName);
  sanitized.ai_summary = sanitizeSummaryLike(row.ai_summary, schoolName);
  sanitized.meta_description = sanitizeMetaDescription(row.meta_description, schoolName);
  sanitized.meta_title = asCleanString(row.meta_title);

  sanitized.website = asCleanString(row.website);
  sanitized.email = asCleanString(row.email);
  sanitized.phone = asCleanString(row.phone);
  sanitized.admission_email = asCleanString(row.admission_email);

  const curriculum = sanitizeStringArray(row.curriculum);
  if (curriculum !== null) sanitized.curriculum = curriculum;

  const languages = sanitizeStringArray(row.languages);
  if (languages !== null) sanitized.languages = languages;

  const phases = sanitizeStringArray(row.phases);
  if (phases !== null) sanitized.phases = phases;

  const strengths = sanitizeStringArray(row.ai_strengths);
  if (strengths !== null) sanitized.ai_strengths = strengths;

  const considerations = sanitizeStringArray(row.ai_considerations);
  if (considerations !== null) sanitized.ai_considerations = considerations;

  return sanitized as T;
}

export function sanitizeSchoolRecords<T extends SchoolRow>(rows: T[]): T[] {
  return rows.map((row) => sanitizeSchoolRecord(row));
}
