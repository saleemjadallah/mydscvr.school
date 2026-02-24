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

import type { CompareResponse } from "@/types";

export async function compareSchools(
  options: { school_ids?: string[]; school_slugs?: string[]; query?: string }
) {
  return fetcher<CompareResponse>("/api/compare", {
    method: "POST",
    body: JSON.stringify(options),
  });
}

/** SSE streaming helper for AI comparison text */
export function streamComparison(
  schoolIds: string[],
  query?: string,
  callbacks?: {
    onText?: (delta: string) => void;
    onDone?: () => void;
    onError?: (message: string) => void;
  }
): AbortController {
  const controller = new AbortController();
  const params = new URLSearchParams({ schools: schoolIds.join(",") });
  if (query) params.set("query", query);

  (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/compare/stream?${params}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        callbacks?.onError?.(
          (body as { error?: string }).error ?? "Stream failed"
        );
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "text") callbacks?.onText?.(event.text);
            else if (event.type === "done") callbacks?.onDone?.();
            else if (event.type === "error") callbacks?.onError?.(event.message);
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        callbacks?.onError?.((err as Error).message ?? "Stream failed");
      }
    }
  })();

  return controller;
}

/* ------------------------------------------------------------------ */
/*  School news & insights (Exa-powered)                               */
/* ------------------------------------------------------------------ */

import type { SchoolNewsResponse, SchoolInsightsResponse, User } from "@/types";

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

/* ------------------------------------------------------------------ */
/*  User profile & activity                                            */
/* ------------------------------------------------------------------ */

export async function getUserProfile() {
  return fetcher<{ user: User }>("/api/user");
}

export async function updateUserProfile(data: Partial<User>) {
  return fetcher<{ user: User }>("/api/user", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getUserActivity() {
  return fetcher<{
    saved_count: number;
    enquiries: unknown[];
    recent_searches: unknown[];
  }>("/api/user/activity");
}
