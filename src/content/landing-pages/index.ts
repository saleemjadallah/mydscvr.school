import type { LandingPageConfig } from "./types";

// ---------------------------------------------------------------------------
// Page imports — one file per landing page
// ---------------------------------------------------------------------------

import { config as britishSchoolsInDubai } from "./pages/british-schools-in-dubai";
import { config as ibSchoolsInDubai } from "./pages/ib-schools-in-dubai";
import { config as indianSchoolsInDubai } from "./pages/indian-schools-in-dubai";
import { config as americanSchoolsInDubai } from "./pages/american-schools-in-dubai";
import { config as schoolsInAlBarsha } from "./pages/schools-in-al-barsha";
import { config as schoolsInJumeirah } from "./pages/schools-in-jumeirah";
import { config as outstandingSchoolsInDubai } from "./pages/outstanding-schools-in-dubai";
import { config as affordableSchoolsUnder30000Aed } from "./pages/affordable-schools-under-30000-aed";
import { config as schoolsWithSenSupportDubai } from "./pages/schools-with-sen-support-dubai";
import { config as nurseriesInDubai } from "./pages/nurseries-in-dubai";
import { config as britishSchoolsInAbuDhabi } from "./pages/british-schools-in-abu-dhabi";
import { config as ibSchoolsInAbuDhabi } from "./pages/ib-schools-in-abu-dhabi";
import { config as schoolsInArabianRanches } from "./pages/schools-in-arabian-ranches";
import { config as schoolsInDubaiMarina } from "./pages/schools-in-dubai-marina";
import { config as schoolsInMotorCity } from "./pages/schools-in-motor-city";
import { config as schoolsInMirdif } from "./pages/schools-in-mirdif";
import { config as schoolsInSiliconOasis } from "./pages/schools-in-silicon-oasis";
import { config as schoolsInAlKhail } from "./pages/schools-in-al-khail";
import { config as americanSchoolsInAbuDhabi } from "./pages/american-schools-in-abu-dhabi";
import { config as indianSchoolsInAbuDhabi } from "./pages/indian-schools-in-abu-dhabi";
import { config as ibSchoolsInAlBarsha } from "./pages/ib-schools-in-al-barsha";
import { config as britishSchoolsInJumeirah } from "./pages/british-schools-in-jumeirah";
import { config as veryGoodSchoolsInDubai } from "./pages/very-good-schools-in-dubai";
import { config as affordableSchoolsUnder20000Aed } from "./pages/affordable-schools-under-20000-aed";
import { config as premiumSchoolsAbove50000Aed } from "./pages/premium-schools-above-50000-aed";

// ---------------------------------------------------------------------------
// Registry — all pages in one array
// ---------------------------------------------------------------------------

const allPages: LandingPageConfig[] = [
  britishSchoolsInDubai,
  ibSchoolsInDubai,
  indianSchoolsInDubai,
  americanSchoolsInDubai,
  schoolsInAlBarsha,
  schoolsInJumeirah,
  outstandingSchoolsInDubai,
  affordableSchoolsUnder30000Aed,
  schoolsWithSenSupportDubai,
  nurseriesInDubai,
  britishSchoolsInAbuDhabi,
  ibSchoolsInAbuDhabi,
  schoolsInArabianRanches,
  schoolsInDubaiMarina,
  schoolsInMotorCity,
  schoolsInMirdif,
  schoolsInSiliconOasis,
  schoolsInAlKhail,
  americanSchoolsInAbuDhabi,
  indianSchoolsInAbuDhabi,
  ibSchoolsInAlBarsha,
  britishSchoolsInJumeirah,
  veryGoodSchoolsInDubai,
  affordableSchoolsUnder20000Aed,
  premiumSchoolsAbove50000Aed,
];

// Validate no duplicate slugs at build time
const slugSet = new Set<string>();
for (const p of allPages) {
  if (slugSet.has(p.slug)) {
    throw new Error(`Duplicate landing page slug: ${p.slug}`);
  }
  slugSet.add(p.slug);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getAllLandingPages(): LandingPageConfig[] {
  return allPages;
}

export function getLandingPage(slug: string): LandingPageConfig | undefined {
  return allPages.find((p) => p.slug === slug);
}

export function getLandingPagesByType(
  type: LandingPageConfig["pageType"]
): LandingPageConfig[] {
  return allPages.filter((p) => p.pageType === type);
}
