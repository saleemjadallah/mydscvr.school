const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/* ------------------------------------------------------------------ */
/*  Generic helpers                                                    */
/* ------------------------------------------------------------------ */

async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ??
        `Request failed with status ${res.status}`
    );
  }

  return res.json() as Promise<T>;
}

function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

/* ------------------------------------------------------------------ */
/*  School search (AI-powered / hybrid)                                */
/* ------------------------------------------------------------------ */

export async function searchSchools(
  query: string,
  filters?: Record<string, unknown>
) {
  return fetcher("/api/search", {
    method: "POST",
    body: JSON.stringify({ query, filters }),
  });
}

/* ------------------------------------------------------------------ */
/*  Schools — listing & detail                                         */
/* ------------------------------------------------------------------ */

export async function getSchools(params?: Record<string, unknown>) {
  return fetcher(`/api/schools${buildQueryString(params)}`);
}

export async function getSchool(slug: string) {
  return fetcher(`/api/schools/${encodeURIComponent(slug)}`);
}

/* ------------------------------------------------------------------ */
/*  Similar schools                                                    */
/* ------------------------------------------------------------------ */

export async function getSimilarSchools(slug: string) {
  return fetcher(`/api/schools/${encodeURIComponent(slug)}/similar`);
}

/* ------------------------------------------------------------------ */
/*  Enquiries                                                          */
/* ------------------------------------------------------------------ */

export async function submitEnquiry(data: Record<string, unknown>) {
  return fetcher("/api/enquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ------------------------------------------------------------------ */
/*  Compare schools                                                    */
/* ------------------------------------------------------------------ */

export async function compareSchools(
  schoolIds: string[],
  query?: string
) {
  return fetcher("/api/compare", {
    method: "POST",
    body: JSON.stringify({ schoolIds, query }),
  });
}

/* ------------------------------------------------------------------ */
/*  School news & insights (Exa-powered)                               */
/* ------------------------------------------------------------------ */

import type { SchoolNewsResponse, SchoolInsightsResponse } from "@/types";

export async function getSchoolNews(slug: string) {
  return fetcher<SchoolNewsResponse>(
    `/api/schools/${encodeURIComponent(slug)}/news`
  );
}

export async function getSchoolInsights(slug: string) {
  return fetcher<SchoolInsightsResponse>(
    `/api/schools/${encodeURIComponent(slug)}/insights`
  );
}
