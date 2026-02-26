"use client";

interface GooglePlaceEmbedProps {
  /** Google Place ID — gives the rich business card (reviews, photos, directions) */
  placeId?: string | null;
  /** Coordinates — used when no placeId is available */
  latitude?: number | null;
  longitude?: number | null;
  /** School name — used as a search fallback when no placeId or coords */
  schoolName: string;
  /** Area / city to help narrow the search fallback */
  area?: string | null;
  height?: number;
}

export default function GooglePlaceEmbed({
  placeId,
  latitude,
  longitude,
  schoolName,
  area,
  height = 350,
}: GooglePlaceEmbedProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!apiKey) return null;

  // Build the best embed URL we can from the available data
  let src: string;

  if (placeId) {
    // Best: place_id shows Google Business card (reviews, photos, hours, directions)
    src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=place_id:${placeId}`;
  } else if (latitude != null && longitude != null) {
    // Good: pin on the map at exact coordinates
    src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=15`;
  } else {
    // Fallback: search by school name + area in Dubai
    const query = encodeURIComponent(
      `${schoolName}${area ? `, ${area}` : ""}, Dubai, UAE`
    );
    src = `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${query}`;
  }

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <iframe
        src={src}
        width="100%"
        height={height}
        className="h-[250px] sm:h-[350px]"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`${schoolName} on Google Maps`}
      />
    </div>
  );
}
