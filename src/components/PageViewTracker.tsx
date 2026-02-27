"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/meta-pixel";

function getSessionId(): string {
  const key = "mydscvr_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Debounce rapid route changes (200ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const key = `${pathname}?${searchParams.toString()}`;
      if (key === lastTracked.current) return;
      lastTracked.current = key;

      try {
        const sessionId = getSessionId();
        const utm_source = searchParams.get("utm_source") || undefined;
        const utm_medium = searchParams.get("utm_medium") || undefined;
        const utm_campaign = searchParams.get("utm_campaign") || undefined;

        const payload = {
          path: pathname,
          referrer: document.referrer || undefined,
          session_id: sessionId,
          utm_source,
          utm_medium,
          utm_campaign,
        };

        // Use sendBeacon for non-blocking, or fall back to fetch
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/track/pageview",
            new Blob([JSON.stringify(payload)], { type: "application/json" })
          );
        } else {
          fetch("/api/track/pageview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
          }).catch(() => {});
        }

        // Fire Meta Pixel PageView for SPA navigations
        trackPageView();
      } catch {
        // Tracking should never fail visibly
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pathname, searchParams]);

  return null;
}
