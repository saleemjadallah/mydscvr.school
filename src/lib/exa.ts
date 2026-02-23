import Exa from "exa-js";

let _exa: Exa | null = null;
function getExa() {
  if (!_exa) {
    _exa = new Exa(process.env.EXA_API_KEY);
  }
  return _exa;
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

export async function searchSchoolNews(
  schoolName: string,
  options?: { numResults?: number; days?: number }
) {
  const { numResults = 5, days = 90 } = options ?? {};

  return getExa().searchAndContents(
    `${schoolName} Dubai school`,
    {
      type: "auto",
      category: "news",
      numResults,
      startPublishedDate: daysAgoISO(days),
      highlights: true,
    }
  );
}

export async function searchSchoolFees(schoolName: string) {
  return getExa().searchAndContents(
    `${schoolName} Dubai school fees tuition`,
    {
      type: "auto",
      numResults: 5,
      text: true,
    }
  );
}

export async function searchSchoolInsights(
  schoolName: string,
  website?: string | null
) {
  const excludeDomains = [
    "gulfnews.com",
    "khaleejtimes.com",
    "thenationalnews.com",
    "arabianbusiness.com",
  ];
  if (website) {
    try {
      const hostname = new URL(website).hostname;
      excludeDomains.push(hostname);
    } catch {
      // invalid URL — skip
    }
  }

  return getExa().searchAndContents(
    `${schoolName} Dubai school review parent experience`,
    {
      type: "auto",
      numResults: 5,
      excludeDomains,
      highlights: true,
    }
  );
}

export async function findSimilarSchools(websiteUrl: string) {
  return getExa().findSimilar(websiteUrl, { numResults: 5 });
}

export async function searchDubaiSchools(query: string) {
  return getExa().searchAndContents(
    `${query} Dubai school`,
    {
      type: "auto",
      numResults: 5,
      highlights: true,
    }
  );
}
