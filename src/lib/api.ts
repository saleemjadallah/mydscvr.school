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
  filters?: Record<string, unknown>,
  location?: { lat: number; lng: number },
  radius_km?: number,
  meta?: { fbp?: string; fbc?: string }
) {
  return fetcher<{ meta_event_id?: string; [key: string]: unknown }>("/api/search", {
    method: "POST",
    body: JSON.stringify({
      query,
      filters,
      ...(location ? { user_lat: location.lat, user_lng: location.lng } : {}),
      ...(radius_km ? { radius_km } : {}),
      ...(meta?.fbp ? { meta_fbp: meta.fbp } : {}),
      ...(meta?.fbc ? { meta_fbc: meta.fbc } : {}),
    }),
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
/*  Featured schools                                                   */
/* ------------------------------------------------------------------ */

import type { School, ExaArticle } from "@/types";

export async function getFeaturedSchools() {
  return fetcher<{ schools: School[] }>("/api/schools/featured");
}

/* ------------------------------------------------------------------ */
/*  Homepage news (aggregated Dubai education)                         */
/* ------------------------------------------------------------------ */

export async function getHomepageNews() {
  return fetcher<{ articles: ExaArticle[]; fetchedAt: string }>("/api/news");
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
    enquiry_stats?: {
      total: number;
      by_status: Record<string, number>;
      response_rate: number;
      pending_count: number;
    };
    unread_notification_count?: number;
  }>("/api/user/activity");
}

/* ------------------------------------------------------------------ */
/*  Enquiry stats                                                      */
/* ------------------------------------------------------------------ */

import type { EnquiryStats, UserNotificationPrefs, EnquiryNotification } from "@/types";

export async function getEnquiryStats() {
  return fetcher<EnquiryStats>("/api/user/enquiry-stats");
}

/* ------------------------------------------------------------------ */
/*  Notification preferences                                           */
/* ------------------------------------------------------------------ */

export async function getNotificationPrefs() {
  return fetcher<{ prefs: UserNotificationPrefs }>("/api/user/notification-prefs");
}

export async function updateNotificationPrefs(data: Partial<UserNotificationPrefs>) {
  return fetcher<{ prefs: UserNotificationPrefs }>("/api/user/notification-prefs", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/* ------------------------------------------------------------------ */
/*  Notifications                                                      */
/* ------------------------------------------------------------------ */

export async function getNotifications() {
  return fetcher<{
    notifications: EnquiryNotification[];
    unread_count: number;
  }>("/api/user/notifications");
}

export async function markNotificationRead(id: string) {
  return fetcher<{ notification: EnquiryNotification }>(
    `/api/user/notifications/${id}`,
    { method: "PUT" }
  );
}

/* ------------------------------------------------------------------ */
/*  Outbound click tracking                                            */
/* ------------------------------------------------------------------ */

import type { SchoolAnalyticsStats, ClickType } from "@/types";

/**
 * Fire-and-forget click tracker. Never throws, never blocks navigation.
 * Uses `keepalive: true` so the request survives page unload.
 */
export function trackClick(params: {
  school_id: string;
  click_type: ClickType;
  destination: string;
  source_page?: string;
  search_query?: string;
  session_id?: string;
}): void {
  try {
    fetch(`${BASE_URL}/api/track/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      keepalive: true,
    }).catch(() => {
      // Silently ignore — tracking must never disrupt UX
    });
  } catch {
    // Sync errors (e.g. body too large for keepalive) — also ignore
  }
}

export async function getSchoolClickStats(schoolId: string, days: number = 30) {
  return fetcher<SchoolAnalyticsStats>(
    `/api/track/stats/${encodeURIComponent(schoolId)}?days=${days}`
  );
}
