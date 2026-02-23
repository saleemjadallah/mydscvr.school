'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Loader2,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { School, KHDARating } from '@/types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DUBAI_CENTER: [number, number] = [55.2708, 25.2048]; // [lng, lat]
const DEFAULT_ZOOM = 11;

const KHDA_MARKER_COLORS: Record<string, string> = {
  Outstanding: '#10b981',
  'Very Good': '#3b82f6',
  Good: '#eab308',
  Acceptable: '#f97316',
  Weak: '#ef4444',
  'Very Weak': '#dc2626',
};

const DEFAULT_MARKER_COLOR = '#6b7280';

const KHDA_RATINGS: KHDARating[] = [
  'Outstanding',
  'Very Good',
  'Good',
  'Acceptable',
  'Weak',
];

const CURRICULA_OPTIONS = [
  'British',
  'American',
  'IB',
  'Indian',
  'French',
  'German',
  'CBSE',
  'MOE',
];

const FEE_RANGES = [
  { label: 'Under AED 20k', min: '', max: '20000' },
  { label: 'AED 20k - 40k', min: '20000', max: '40000' },
  { label: 'AED 40k - 60k', min: '40000', max: '60000' },
  { label: 'AED 60k - 80k', min: '60000', max: '80000' },
  { label: 'AED 80k+', min: '80000', max: '' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'school', label: 'Schools' },
  { value: 'nursery', label: 'Nurseries' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Filters {
  type: string;
  curriculum: string;
  rating: KHDARating | '';
  feeMin: string;
  feeMax: string;
}

const DEFAULT_FILTERS: Filters = {
  type: '',
  curriculum: '',
  rating: '',
  feeMin: '',
  feeMax: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFee(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildFeeLabel(feeMin: number | null, feeMax: number | null): string {
  if (feeMin != null && feeMax != null) {
    return `AED ${formatFee(feeMin)} &ndash; ${formatFee(feeMax)}`;
  }
  if (feeMin != null) return `From AED ${formatFee(feeMin)}`;
  if (feeMax != null) return `Up to AED ${formatFee(feeMax)}`;
  return 'Fees not listed';
}

function matchesFilters(school: School, filters: Filters): boolean {
  if (filters.type && school.type !== filters.type) return false;
  if (
    filters.curriculum &&
    (!school.curriculum || !school.curriculum.includes(filters.curriculum))
  )
    return false;
  if (filters.rating && school.khda_rating !== filters.rating) return false;
  if (filters.feeMin && (school.fee_max == null || school.fee_max < Number(filters.feeMin)))
    return false;
  if (filters.feeMax && (school.fee_min == null || school.fee_min > Number(filters.feeMax)))
    return false;
  return true;
}

// ---------------------------------------------------------------------------
// Filter Panel
// ---------------------------------------------------------------------------

function FilterPanel({
  filters,
  onChange,
  onReset,
  schoolCount,
  totalCount,
  mobile,
  onClose,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  schoolCount: number;
  totalCount: number;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const activeCount =
    (filters.type ? 1 : 0) +
    (filters.curriculum ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    (filters.feeMin || filters.feeMax ? 1 : 0);

  const panelClasses = mobile
    ? 'fixed inset-0 z-[60] overflow-y-auto bg-white p-6'
    : 'absolute left-4 top-4 z-10 w-72 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm';

  return (
    <div className={panelClasses}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          <p className="text-xs text-gray-500">
            Showing {schoolCount} of {totalCount} schools
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-[#FF6B35] hover:underline"
            >
              Clear ({activeCount})
            </button>
          )}
          {mobile && onClose && (
            <button type="button" onClick={onClose}>
              <X className="size-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Type */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-600">Type</p>
          <div className="flex gap-1.5">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...filters, type: opt.value })}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  filters.type === opt.value
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Curriculum */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-600">Curriculum</p>
          <div className="relative">
            <select
              value={filters.curriculum}
              onChange={(e) =>
                onChange({ ...filters, curriculum: e.target.value })
              }
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-1.5 pr-8 text-xs text-gray-700 focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
            >
              <option value="">All curricula</option>
              {CURRICULA_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* KHDA Rating */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-600">KHDA Rating</p>
          <div className="relative">
            <select
              value={filters.rating}
              onChange={(e) =>
                onChange({
                  ...filters,
                  rating: e.target.value as KHDARating | '',
                })
              }
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-1.5 pr-8 text-xs text-gray-700 focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
            >
              <option value="">Any rating</option>
              {KHDA_RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Fee Range */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-600">Fee Range</p>
          <div className="space-y-1">
            {FEE_RANGES.map((fr) => {
              const isActive =
                filters.feeMin === fr.min && filters.feeMax === fr.max;
              return (
                <button
                  key={fr.label}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...filters,
                      feeMin: isActive ? '' : fr.min,
                      feeMax: isActive ? '' : fr.max,
                    })
                  }
                  className={`block w-full rounded-lg border px-3 py-1.5 text-left text-xs transition-colors ${
                    isActive
                      ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {fr.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile apply button */}
      {mobile && (
        <Button
          onClick={onClose}
          className="mt-4 w-full bg-[#FF6B35] text-white hover:bg-[#e55a2a]"
        >
          Apply Filters
        </Button>
      )}

      {/* Legend */}
      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="mb-2 text-xs font-medium text-gray-600">
          Marker colors (KHDA)
        </p>
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(KHDA_MARKER_COLORS).map(([rating, color]) => (
            <div key={rating} className="flex items-center gap-1.5">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-gray-500">{rating}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: DEFAULT_MARKER_COLOR }}
            />
            <span className="text-[10px] text-gray-500">Not rated</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Map Page
// ---------------------------------------------------------------------------

export default function MapPage() {
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Fetch all schools on mount
  useEffect(() => {
    async function fetchSchools() {
      try {
        const res = await fetch('/api/schools?limit=200');
        if (!res.ok) throw new Error('Failed to fetch schools');
        const data = await res.json();
        setAllSchools(data.schools ?? []);
      } catch (err: unknown) {
        setError((err as Error).message ?? 'Failed to load schools');
      } finally {
        setLoading(false);
      }
    }
    fetchSchools();
  }, []);

  // Initialize map
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !mapContainerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: DUBAI_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      'top-right'
    );

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Filtered schools
  const filteredSchools = allSchools.filter((s) => matchesFilters(s, filters));

  // Update markers when filteredSchools change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const validSchools = filteredSchools.filter(
      (s) => s.latitude != null && s.longitude != null
    );

    validSchools.forEach((school) => {
      const lng = school.longitude!;
      const lat = school.latitude!;
      const color =
        (school.khda_rating && KHDA_MARKER_COLORS[school.khda_rating]) ||
        DEFAULT_MARKER_COLOR;

      const popupHTML = `
        <div style="min-width:200px; font-family:system-ui,sans-serif;">
          <h4 style="margin:0 0 4px; font-size:14px; font-weight:600; color:#111;">
            ${school.name}
          </h4>
          ${
            school.area
              ? `<p style="margin:0 0 2px; font-size:12px; color:#555;">
                   ${school.area}
                 </p>`
              : ''
          }
          ${
            school.khda_rating
              ? `<p style="margin:0 0 2px; font-size:12px; color:#555;">
                   KHDA: <strong>${school.khda_rating}</strong>
                 </p>`
              : ''
          }
          ${
            school.google_rating
              ? `<p style="margin:0 0 2px; font-size:12px; color:#555;">
                   Google: <strong>${school.google_rating.toFixed(1)}</strong>/5
                 </p>`
              : ''
          }
          <p style="margin:0 0 6px; font-size:12px; color:#555;">
            ${buildFeeLabel(school.fee_min, school.fee_max)}
          </p>
          <a
            href="/schools/${school.slug}"
            style="font-size:12px; color:#FF6B35; text-decoration:none; font-weight:500;"
          >
            View Profile &rarr;
          </a>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '260px' }).setHTML(
        popupHTML
      );

      const marker = new mapboxgl.Marker({ color })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [filteredSchools]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // No token state
  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <div className="text-center">
          <MapPin className="mx-auto size-12 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Map not configured
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the map view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-lg">
            <Loader2 className="size-5 animate-spin text-[#FF6B35]" />
            <span className="text-sm font-medium text-gray-700">
              Loading schools...
            </span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="rounded-xl border border-red-200 bg-white p-6 text-center shadow-lg">
            <p className="font-medium text-red-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Desktop filter panel */}
      <div className="hidden md:block">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          schoolCount={filteredSchools.filter((s) => s.latitude != null && s.longitude != null).length}
          totalCount={allSchools.filter((s) => s.latitude != null && s.longitude != null).length}
        />
      </div>

      {/* Mobile filter button */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 md:hidden">
        <Button
          onClick={() => setMobileFiltersOpen(true)}
          className="bg-white text-gray-700 shadow-lg hover:bg-gray-50"
        >
          <SlidersHorizontal className="mr-2 size-4" />
          Filters
          {(filters.type || filters.curriculum || filters.rating || filters.feeMin || filters.feeMax) && (
            <Badge className="ml-2 bg-[#FF6B35] text-white text-[10px] px-1.5">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile filter panel */}
      {mobileFiltersOpen && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          schoolCount={filteredSchools.filter((s) => s.latitude != null && s.longitude != null).length}
          totalCount={allSchools.filter((s) => s.latitude != null && s.longitude != null).length}
          mobile
          onClose={() => setMobileFiltersOpen(false)}
        />
      )}
    </div>
  );
}
