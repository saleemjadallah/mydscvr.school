"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackClick } from "@/lib/api";

interface SchoolMapsLinkProps {
  schoolId: string;
  schoolName: string;
  googlePlaceId: string | null;
  latitude: number | null;
  longitude: number | null;
  area: string | null;
}

export default function SchoolMapsLink({
  schoolId,
  schoolName,
  googlePlaceId,
  latitude,
  longitude,
  area,
}: SchoolMapsLinkProps) {
  const href = googlePlaceId
    ? `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${googlePlaceId}`
    : latitude && longitude
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${schoolName}, ${area ?? "Dubai"}, UAE`)}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        trackClick({
          school_id: schoolId,
          click_type: "maps",
          destination: href,
          source_page: "school-profile",
        });
      }}
    >
      <Button variant="outline" size="sm" className="gap-1.5">
        <ExternalLink className="size-3.5" />
        Open in Google Maps
      </Button>
    </Link>
  );
}
