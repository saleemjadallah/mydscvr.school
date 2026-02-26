import { NextRequest, NextResponse } from "next/server";
import db from "@/db";

const PAGE_TYPE_MAP: Record<string, string> = {
  "/": "home",
  "/schools": "school_listing",
  "/nurseries": "nursery_listing",
  "/compare": "compare",
  "/map": "map",
};

function detectPageType(path: string): string {
  if (PAGE_TYPE_MAP[path]) return PAGE_TYPE_MAP[path];
  if (path.match(/^\/schools\/[^/]+$/)) return "school_profile";
  if (path.startsWith("/schools")) return "school_listing";
  if (path.startsWith("/nurseries")) return "nursery_listing";
  return "other";
}

function detectDeviceType(ua: string | null): string {
  if (!ua) return "unknown";
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    return /ipad|tablet/i.test(ua) ? "tablet" : "mobile";
  }
  return "desktop";
}

// POST /api/track/pageview — Fire-and-forget page view tracking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, school_id, referrer, utm_source, utm_medium, utm_campaign, session_id } = body;

    if (!path) {
      return NextResponse.json({ tracked: false }, { status: 400 });
    }

    const ip_address = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip") || null;
    const user_agent = req.headers.get("user-agent") || null;
    const device_type = detectDeviceType(user_agent);
    const page_type = detectPageType(path);

    // Optional user_id (non-blocking)
    let user_id: string | null = null;
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const { userId } = await auth();
      if (userId) {
        const userResult = await db.query(
          "SELECT id FROM users WHERE clerk_id = $1 LIMIT 1",
          [userId]
        );
        if (userResult.rows.length > 0) {
          user_id = userResult.rows[0].id;
        }
      }
    } catch {
      // Auth not available — fine
    }

    // Resolve school_id from slug for school profiles
    let resolvedSchoolId = school_id || null;
    if (!resolvedSchoolId && page_type === "school_profile") {
      const slug = path.split("/").pop();
      if (slug) {
        try {
          const schoolResult = await db.query(
            "SELECT id FROM schools WHERE slug = $1 LIMIT 1",
            [slug]
          );
          if (schoolResult.rows.length > 0) {
            resolvedSchoolId = schoolResult.rows[0].id;
          }
        } catch {
          // Non-fatal
        }
      }
    }

    await db.query(
      `INSERT INTO page_views
        (path, page_type, school_id, user_id, session_id, referrer, utm_source, utm_medium, utm_campaign, ip_address, user_agent, device_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        path, page_type, resolvedSchoolId, user_id, session_id || null,
        referrer || null, utm_source || null, utm_medium || null, utm_campaign || null,
        ip_address, user_agent, device_type,
      ]
    );

    return NextResponse.json({ tracked: true });
  } catch (err) {
    console.error("[track/pageview] Error:", err);
    return NextResponse.json({ tracked: false });
  }
}
