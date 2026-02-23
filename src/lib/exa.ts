import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);

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

  return exa.searchAndContents(
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
  return exa.searchAndContents(
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

  return exa.searchAndContents(
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
  return exa.findSimilar(websiteUrl, { numResults: 5 });
}

export async function searchDubaiSchools(query: string) {
  return exa.searchAndContents(
    `${query} Dubai school`,
    {
      type: "auto",
      numResults: 5,
      highlights: true,
    }
  );
}
