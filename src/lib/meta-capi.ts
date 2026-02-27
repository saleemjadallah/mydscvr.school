/**
 * Meta Conversions API (server-side) utility.
 * Sends events to Meta's Graph API for server-side attribution.
 * Fire-and-forget — never throws, logs errors to console.
 */

import { createHash } from "crypto";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN ?? "";
const GRAPH_API_VERSION = "v21.0";

// ---------------------------------------------------------------------------
// SHA-256 hashing (Meta requires lowercase + trimmed + SHA-256)
// ---------------------------------------------------------------------------

function sha256(value: string): string {
  return createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

// ---------------------------------------------------------------------------
// Cookie parsing (server-side)
// ---------------------------------------------------------------------------

export function getCookieValue(
  cookieHeader: string | null,
  name: string
): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

// ---------------------------------------------------------------------------
// User data builder
// ---------------------------------------------------------------------------

interface CAPIUserInput {
  email?: string | null;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  external_id?: string | null;
}

interface CAPIUserData {
  em?: string[];
  ph?: string[];
  fn?: string;
  ln?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
  external_id?: string;
}

function buildUserData(user: CAPIUserInput): CAPIUserData {
  const data: CAPIUserData = {};

  if (user.email) {
    data.em = [sha256(user.email)];
  }
  if (user.phone) {
    // Normalize: strip spaces, dashes, parens
    const normalized = user.phone.replace(/[\s\-()]/g, "");
    data.ph = [sha256(normalized)];
  }
  if (user.first_name) {
    data.fn = sha256(user.first_name);
  }
  if (user.last_name) {
    data.ln = sha256(user.last_name);
  }
  if (user.ip) {
    data.client_ip_address = user.ip;
  }
  if (user.user_agent) {
    data.client_user_agent = user.user_agent;
  }
  if (user.fbp) {
    data.fbp = user.fbp;
  }
  if (user.fbc) {
    data.fbc = user.fbc;
  }
  if (user.external_id) {
    data.external_id = sha256(user.external_id);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Core event sender
// ---------------------------------------------------------------------------

interface CAPIEvent {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url?: string;
  action_source: "website";
  user_data: CAPIUserData;
  custom_data?: Record<string, unknown>;
}

async function sendEvents(events: CAPIEvent[]): Promise<void> {
  if (!ACCESS_TOKEN || !PIXEL_ID) return;

  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: events,
        access_token: ACCESS_TOKEN,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        `[Meta CAPI] ${res.status} error for ${events[0]?.event_name}:`,
        body
      );
    }
  } catch (err) {
    console.error("[Meta CAPI] Network error:", err);
  }
}

// ---------------------------------------------------------------------------
// Public helpers — all fire-and-forget
// ---------------------------------------------------------------------------

interface TrackCAPIOptions {
  event_id?: string;
  event_source_url?: string;
  user: CAPIUserInput;
  custom_data?: Record<string, unknown>;
}

export function trackCAPILead(opts: TrackCAPIOptions): void {
  sendEvents([
    {
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: opts.event_id,
      event_source_url: opts.event_source_url,
      action_source: "website",
      user_data: buildUserData(opts.user),
      custom_data: opts.custom_data,
    },
  ]);
}

export function trackCAPISearch(opts: {
  event_id?: string;
  event_source_url?: string;
  search_string: string;
  user: CAPIUserInput;
}): void {
  sendEvents([
    {
      event_name: "Search",
      event_time: Math.floor(Date.now() / 1000),
      event_id: opts.event_id,
      event_source_url: opts.event_source_url,
      action_source: "website",
      user_data: buildUserData(opts.user),
      custom_data: { search_string: opts.search_string },
    },
  ]);
}

export function trackCAPIViewContent(opts: TrackCAPIOptions): void {
  sendEvents([
    {
      event_name: "ViewContent",
      event_time: Math.floor(Date.now() / 1000),
      event_id: opts.event_id,
      event_source_url: opts.event_source_url,
      action_source: "website",
      user_data: buildUserData(opts.user),
      custom_data: opts.custom_data,
    },
  ]);
}

export function trackCAPIAddToWishlist(opts: TrackCAPIOptions): void {
  sendEvents([
    {
      event_name: "AddToWishlist",
      event_time: Math.floor(Date.now() / 1000),
      event_id: opts.event_id,
      event_source_url: opts.event_source_url,
      action_source: "website",
      user_data: buildUserData(opts.user),
      custom_data: opts.custom_data,
    },
  ]);
}
