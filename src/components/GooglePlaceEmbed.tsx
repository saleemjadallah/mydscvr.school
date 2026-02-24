"use client";

interface GooglePlaceEmbedProps {
  placeId: string;
  schoolName: string;
}

export default function GooglePlaceEmbed({
  placeId,
  schoolName,
}: GooglePlaceEmbedProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  if (!apiKey) return null;

  const src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=place_id:${placeId}`;

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <iframe
        src={src}
        width="100%"
        height="300"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`${schoolName} on Google Maps`}
      />
    </div>
  );
}
