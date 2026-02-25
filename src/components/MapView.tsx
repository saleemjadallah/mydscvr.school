"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { KHDARating } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MapSchool {
  latitude: number | null;
  longitude: number | null;
  name: string;
  slug: string;
  khda_rating: KHDARating | null;
  fee_min: number | null;
  fee_max: number | null;
  distance_km?: number;
  distance_label?: string;
}

interface MapViewProps {
  schools: MapSchool[];
  center?: { lat: number; lng: number; label?: string };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const KHDA_MARKER_COLORS: Record<string, string> = {
  Outstanding: "#10b981", // emerald-500
  "Very Good": "#3b82f6", // blue-500
  Good: "#eab308", // yellow-500
  Acceptable: "#f97316", // orange-500
  Weak: "#ef4444", // red-500
  "Very Weak": "#dc2626", // red-600
};

const DEFAULT_MARKER_COLOR = "#6b7280"; // gray-500

function formatFee(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildFeeLabel(feeMin: number | null, feeMax: number | null): string {
  if (feeMin != null && feeMax != null) {
    return `AED ${formatFee(feeMin)} – ${formatFee(feeMax)}`;
  }
  if (feeMin != null) return `From AED ${formatFee(feeMin)}`;
  if (feeMax != null) return `Up to AED ${formatFee(feeMax)}`;
  return "Fees not listed";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MapView({ schools, center }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialise map once
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !mapContainerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [55.2708, 25.2048], // Dubai [lng, lat]
      zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers whenever schools change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const validSchools = schools.filter(
      (s) => s.latitude != null && s.longitude != null
    );

    if (validSchools.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    validSchools.forEach((school) => {
      const lng = school.longitude!;
      const lat = school.latitude!;
      const color =
        (school.khda_rating && KHDA_MARKER_COLORS[school.khda_rating]) ||
        DEFAULT_MARKER_COLOR;

      // Build popup HTML
      const popupHTML = `
        <div style="min-width:180px; font-family:system-ui,sans-serif;">
          <h4 style="margin:0 0 4px; font-size:14px; font-weight:600; color:#111;">
            ${school.name}
          </h4>
          ${
            school.khda_rating
              ? `<p style="margin:0 0 2px; font-size:12px; color:#555;">
                   KHDA: <strong>${school.khda_rating}</strong>
                 </p>`
              : ""
          }
          <p style="margin:0 0 2px; font-size:12px; color:#555;">
            ${buildFeeLabel(school.fee_min, school.fee_max)}
          </p>
          ${
            school.distance_label
              ? `<p style="margin:0 0 4px; font-size:12px; color:#FF6B35; font-weight:500;">
                   ${school.distance_label}
                 </p>`
              : ""
          }
          <a
            href="/schools/${school.slug}"
            style="font-size:12px; color:#FF6B35; text-decoration:none; font-weight:500;"
          >
            View Profile &rarr;
          </a>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "240px" }).setHTML(
        popupHTML
      );

      const marker = new mapboxgl.Marker({ color })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    // Add reference location marker if center prop provided
    if (center) {
      const refEl = document.createElement("div");
      refEl.style.width = "20px";
      refEl.style.height = "20px";
      refEl.style.borderRadius = "50%";
      refEl.style.backgroundColor = "#FF6B35";
      refEl.style.border = "3px solid white";
      refEl.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

      const refPopup = new mapboxgl.Popup({ offset: 15, maxWidth: "200px" }).setHTML(
        `<div style="font-family:system-ui,sans-serif; font-size:13px; font-weight:500; color:#FF6B35;">
          ${center.label ?? "Search location"}
        </div>`
      );

      const refMarker = new mapboxgl.Marker({ element: refEl })
        .setLngLat([center.lng, center.lat])
        .setPopup(refPopup)
        .addTo(map);

      markersRef.current.push(refMarker);
      bounds.extend([center.lng, center.lat]);
    }

    // Fit map to markers with padding
    if (center) {
      map.flyTo({ center: [center.lng, center.lat], zoom: 12 });
    } else if (validSchools.length === 1) {
      map.flyTo({ center: [validSchools[0].longitude!, validSchools[0].latitude!], zoom: 14 });
    } else {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }
  }, [schools, center]);

  return (
    <div
      ref={mapContainerRef}
      className="h-[350px] sm:h-[450px] md:h-[600px] w-full rounded-xl border shadow-sm"
    />
  );
}
