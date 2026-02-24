import { cache } from "@/lib/cache";

// ---------------------------------------------------------------------------
// Haversine distance (km)
// ---------------------------------------------------------------------------

const R_KM = 6371;

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ---------------------------------------------------------------------------
// Distance score: 0–1 linear decay over maxRadius km
// ---------------------------------------------------------------------------

export function distanceScore(distanceKm: number, maxRadius = 30): number {
  return Math.max(0, 1 - distanceKm / maxRadius);
}

// ---------------------------------------------------------------------------
// Dubai bounding box check
// ---------------------------------------------------------------------------

const DUBAI_BOUNDS = {
  latMin: 24.79,
  latMax: 25.34,
  lngMin: 54.89,
  lngMax: 55.87,
};

export function isInDubai(lat: number, lng: number): boolean {
  return (
    lat >= DUBAI_BOUNDS.latMin &&
    lat <= DUBAI_BOUNDS.latMax &&
    lng >= DUBAI_BOUNDS.lngMin &&
    lng <= DUBAI_BOUNDS.lngMax
  );
}

// ---------------------------------------------------------------------------
// Mapbox Geocoding v6 — forward geocode a place name within Dubai
// ---------------------------------------------------------------------------

interface GeocodeResult {
  lat: number;
  lng: number;
  placeName: string;
}

export async function geocodePlace(
  placeName: string,
  mapboxToken: string
): Promise<GeocodeResult | null> {
  const normalized = placeName.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) return null;

  // Check Redis cache first
  const cacheKey = `geo:forward:${normalized}`;
  const cached = await cache.get<GeocodeResult>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: placeName.trim(),
    access_token: mapboxToken,
    bbox: "54.89,24.79,55.87,25.34", // Dubai bbox
    proximity: "55.2708,25.2048", // Dubai center
    limit: "1",
    language: "en",
  });

  try {
    const res = await fetch(
      `https://api.mapbox.com/search/geocode/v6/forward?${params}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;

    const [lng, lat] = feature.geometry.coordinates as [number, number];
    const result: GeocodeResult = {
      lat,
      lng,
      placeName: feature.properties?.full_address ?? feature.properties?.name ?? placeName,
    };

    // Cache for 24 hours
    await cache.set(cacheKey, result, 86400);
    return result;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Format distance for display
// ---------------------------------------------------------------------------

export function formatDistanceLabel(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}
