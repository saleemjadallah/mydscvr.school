/**
 * Meta Pixel (client-side) helpers.
 * Wraps `fbq()` calls with type safety and graceful degradation
 * when the pixel script is blocked by ad blockers.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

// ---------------------------------------------------------------------------
// fbq() typed wrapper
// ---------------------------------------------------------------------------

type FbqStandard =
  | "PageView"
  | "Lead"
  | "Search"
  | "ViewContent"
  | "AddToWishlist";

interface FbqFn {
  (method: "track", event: FbqStandard, params?: Record<string, unknown>): void;
  (method: "init", pixelId: string): void;
}

declare global {
  interface Window {
    fbq?: FbqFn & { callMethod?: unknown };
  }
}

function fbq(
  method: "track",
  event: FbqStandard,
  params?: Record<string, unknown>
): void;
function fbq(method: "init", pixelId: string): void;
function fbq(
  method: string,
  eventOrId: string,
  params?: Record<string, unknown>
): void {
  try {
    if (typeof window !== "undefined" && window.fbq) {
      const fn = window.fbq as (...args: unknown[]) => void;
      if (params) {
        fn(method, eventOrId, params);
      } else {
        fn(method, eventOrId);
      }
    }
  } catch {
    // Pixel blocked or not loaded — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Event ID generation (for deduplication with CAPI)
// ---------------------------------------------------------------------------

export function generateEventId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ---------------------------------------------------------------------------
// Cookie readers (_fbp / _fbc)
// ---------------------------------------------------------------------------

export function getFbp(): string | undefined {
  return getCookie("_fbp") || undefined;
}

export function getFbc(): string | undefined {
  // _fbc may also come from the fbclid URL parameter
  const cookie = getCookie("_fbc");
  if (cookie) return cookie;

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid");
    if (fbclid) {
      return `fb.1.${Date.now()}.${fbclid}`;
    }
  }
  return undefined;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

// ---------------------------------------------------------------------------
// Standard event helpers
// ---------------------------------------------------------------------------

export function trackPageView(): void {
  if (!PIXEL_ID) return;
  fbq("track", "PageView");
}

export function trackViewContent(params: {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
}): void {
  if (!PIXEL_ID) return;
  fbq("track", "ViewContent", params);
}

export function trackSearch(params: {
  search_string: string;
  eventId?: string;
}): void {
  if (!PIXEL_ID) return;
  fbq("track", "Search", {
    search_string: params.search_string,
    ...(params.eventId ? { eventID: params.eventId } : {}),
  });
}

export function trackLead(params: {
  content_name?: string;
  content_ids?: string[];
  eventId: string;
}): void {
  if (!PIXEL_ID) return;
  fbq("track", "Lead", {
    content_name: params.content_name,
    content_ids: params.content_ids,
    eventID: params.eventId,
  });
}

export function trackAddToWishlist(params: {
  content_ids?: string[];
  content_name?: string;
  eventId: string;
}): void {
  if (!PIXEL_ID) return;
  fbq("track", "AddToWishlist", {
    content_ids: params.content_ids,
    content_name: params.content_name,
    eventID: params.eventId,
  });
}
