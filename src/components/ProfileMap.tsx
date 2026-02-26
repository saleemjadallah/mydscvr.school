'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ProfileMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address?: string | null;
}

export default function ProfileMap({
  latitude,
  longitude,
  name,
  address,
}: ProfileMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [longitude, latitude],
      zoom: 14,
      interactive: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const popupHTML = `
      <div style="font-family:system-ui,sans-serif;">
        <p style="margin:0; font-size:13px; font-weight:600; color:#111;">${name}</p>
        ${address ? `<p style="margin:2px 0 0; font-size:11px; color:#666;">${address}</p>` : ''}
      </div>
    `;

    new mapboxgl.Marker({ color: '#FF6B35' })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25, maxWidth: '240px' }).setHTML(popupHTML)
      )
      .addTo(map);

    return () => {
      map.remove();
    };
  }, [latitude, longitude, name, address]);

  return (
    <div
      ref={containerRef}
      className="h-48 sm:h-64 w-full rounded-xl border shadow-sm"
    />
  );
}
