import { NextRequest, NextResponse } from "next/server";
import db from "@/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { school_id, click_type, destination, source_page, search_query, session_id } = body;

    if (!school_id || !click_type || !destination) {
      return NextResponse.json({ tracked: false, error: "Missing required fields" }, { status: 400 });
    }

    const validTypes = ["website", "phone", "whatsapp", "email", "maps"];
    if (!validTypes.includes(click_type)) {
      return NextResponse.json({ tracked: false, error: "Invalid click_type" }, { status: 400 });
    }

    // Extract IP address
    const forwarded = req.headers.get("x-forwarded-for");
    const ip_address = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;

    // Extract user agent
    const user_agent = req.headers.get("user-agent") || null;

    // Optional Clerk user ID (never block on auth failure)
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
      // Auth not available or user not in DB — that's fine
    }

    // UTM params for outbound website/maps links
    let redirect_url: string | undefined;
    const utm_source = "mydscvr";
    const utm_medium = "listing";

    if (click_type === "website" || click_type === "maps") {
      try {
        const url = new URL(destination);
        url.searchParams.set("utm_source", utm_source);
        url.searchParams.set("utm_medium", utm_medium);
        url.searchParams.set("utm_campaign", "school-profile");
        redirect_url = url.toString();
      } catch {
        // If destination isn't a valid URL, just skip UTM
        redirect_url = destination;
      }
    }

    // Insert into DB
    await db.query(
      `INSERT INTO outbound_clicks
        (school_id, user_id, click_type, destination, source_page, search_query, session_id, ip_address, user_agent, utm_source, utm_medium)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [school_id, user_id, click_type, destination, source_page || null, search_query || null, session_id || null, ip_address, user_agent, utm_source, utm_medium]
    );

    return NextResponse.json({
      tracked: true,
      ...(redirect_url ? { redirect_url } : {}),
    });
  } catch (err) {
    console.error("[track/click] Error:", err);
    // Tracking should never visibly fail
    return NextResponse.json({ tracked: false });
  }
}
