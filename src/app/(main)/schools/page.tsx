'use client';

export const dynamic = "force-dynamic";

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import {
  Search,
  LayoutGrid,
  Map,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronDown,
  ArrowUpDown,
  Loader2,
  Navigation,
  Locate,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import SchoolCard from '@/components/SchoolCard';
import MapView from '@/components/MapView';
import SignUpWallModal from '@/components/SignUpWallModal';
import { useSavedSchools } from '@/hooks/useSavedSchools';
import { useUserLocation } from '@/hooks/useUserLocation';
import { displayAreaName } from '@/lib/dubai-areas';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type {
  School,
  SearchResponse,
  SchoolListResponse,
  KHDARating,
  LocationContext,
} from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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
  { label: 'Under AED 20,000', min: '', max: '20000' },
  { label: 'AED 20,000 - 40,000', min: '20000', max: '40000' },
  { label: 'AED 40,000 - 60,000', min: '40000', max: '60000' },
  { label: 'AED 60,000 - 80,000', min: '60000', max: '80000' },
  { label: 'AED 80,000+', min: '80000', max: '' },
];

function getRatingSortLabel(emirate: string) {
  if (emirate === 'dubai') return 'KHDA Rating';
  if (emirate === 'abu_dhabi') return 'ADEK Rating';
  return 'Rating';
}

const BASE_SORT_OPTIONS = [
  { value: 'rating', label: 'KHDA Rating' },
  { value: 'fee_asc', label: 'Fees: Low to High' },
  { value: 'fee_desc', label: 'Fees: High to Low' },
  { value: 'reviews', label: 'Most Reviewed' },
] as const;

const DISTANCE_SORT_OPTION = { value: 'distance', label: 'Nearest First' } as const;

type SortOption = 'rating' | 'fee_asc' | 'fee_desc' | 'reviews' | 'distance';

const RADIUS_OPTIONS = [5, 10, 15, 20] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Filters {
  emirate: 'dubai' | 'abu_dhabi' | '';
  type: 'school' | 'nursery' | '';
  rating: KHDARating | '';
  curriculum: string[];
  feeMin: string;
  feeMax: string;
  hasSen: boolean;
  area: string;
  radiusKm: number | '';
}

const DEFAULT_FILTERS: Filters = {
  emirate: '',
  type: '',
  rating: '',
  curriculum: [],
  feeMin: '',
  feeMax: '',
  hasSen: false,
  area: '',
  radiusKm: '',
};

// ---------------------------------------------------------------------------
// Fetcher helpers
// ---------------------------------------------------------------------------

async function aiSearch(
  query: string,
  filters: Filters,
  location?: { lat: number; lng: number } | null,
  radiusKm?: number | ''
): Promise<SearchResponse> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      filters: {
        ...(filters.type ? { type: filters.type } : {}),
      },
      ...(location ? { user_lat: location.lat, user_lng: location.lng } : {}),
      ...(radiusKm ? { radius_km: radiusKm } : {}),
    }),
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

async function fetchSchools(
  filters: Filters,
  page: number,
  sort: SortOption,
  location?: { lat: number; lng: number } | null,
): Promise<SchoolListResponse> {
  const params = new URLSearchParams();
  if (filters.emirate) params.set('emirate', filters.emirate);
  if (filters.type) params.set('type', filters.type);
  if (filters.rating) params.set('rating', filters.rating);
  if (filters.curriculum.length) params.set('curriculum', filters.curriculum[0]);
  if (filters.feeMin) params.set('fee_min', filters.feeMin);
  if (filters.feeMax) params.set('fee_max', filters.feeMax);
  if (filters.hasSen) params.set('has_sen', 'true');
  if (filters.area) params.set('area', filters.area);
  if (location) {
    params.set('lat', String(location.lat));
    params.set('lng', String(location.lng));
  }
  if (filters.radiusKm) params.set('radius_km', String(filters.radiusKm));
  params.set('page', String(page));
  params.set('limit', '20');
  params.set('sort', sort);

  const res = await fetch(`/api/schools?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch schools');
  return res.json();
}

async function fetchAreas(emirate?: string): Promise<{ name: string; count: number }[]> {
  const params = emirate ? `?emirate=${emirate}` : '';
  const res = await fetch(`/api/schools/areas${params}`);
  if (!res.ok) return [];
  return res.json();
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function SchoolCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white overflow-hidden sm:overflow-visible sm:p-5 animate-pulse" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Mobile: vertical layout | Desktop: horizontal */}
      <div className="flex flex-col sm:flex-row sm:gap-5">
        {/* Photo skeleton */}
        <div className="h-40 w-full bg-gray-200 sm:size-32 sm:flex-shrink-0 sm:rounded-xl sm:h-32" />
        {/* Details skeleton */}
        <div className="flex flex-1 flex-col gap-2.5 p-3.5 sm:p-0">
          <div className="h-5 w-3/4 rounded bg-gray-200" />
          <div className="h-3.5 w-1/2 rounded bg-gray-200" />
          <div className="flex gap-1.5">
            <div className="h-5 w-16 rounded bg-gray-200" />
            <div className="h-5 w-14 rounded bg-gray-200" />
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 sm:border-0 sm:pt-0 sm:mt-auto">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-8 w-24 rounded-lg bg-gray-200" />
          </div>
        </div>
        {/* Desktop-only fee/CTA skeleton */}
        <div className="hidden sm:flex flex-col items-end justify-between">
          <div className="h-8 w-24 rounded bg-gray-200" />
          <div className="h-8 w-20 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search Filters (inline sidebar)
// ---------------------------------------------------------------------------

function SearchFilters({
  filters,
  onChange,
  onReset,
  areas,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  areas: { name: string; count: number }[];
}) {
  const toggleCurriculum = (c: string) => {
    const next = filters.curriculum.includes(c)
      ? filters.curriculum.filter((x) => x !== c)
      : [...filters.curriculum, c];
    onChange({ ...filters, curriculum: next });
  };

  const ratingFilterLabel = filters.emirate === 'dubai' ? 'KHDA Rating'
    : filters.emirate === 'abu_dhabi' ? 'ADEK Rating'
    : 'Inspection Rating';

  const activeCount =
    (filters.emirate ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    filters.curriculum.length +
    (filters.feeMin || filters.feeMax ? 1 : 0) +
    (filters.hasSen ? 1 : 0) +
    (filters.area ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-[#FF6B35] hover:underline"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {/* ---- Emirate ---- */}
      <div>
        <p className="mb-2.5 text-sm font-medium text-gray-700">Emirate</p>
        <div className="flex gap-2">
          {([['', 'All'], ['dubai', 'Dubai'], ['abu_dhabi', 'Abu Dhabi']] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange({ ...filters, emirate: val as Filters['emirate'], area: val !== filters.emirate ? '' : filters.area })}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                filters.emirate === val
                  ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Type ---- */}
      <div>
        <p className="mb-2.5 text-sm font-medium text-gray-700">Type</p>
        <div className="flex gap-2">
          {(['', 'school', 'nursery'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...filters, type: t })}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                filters.type === t
                  ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {t === '' ? 'All' : t === 'school' ? 'Schools' : 'Nurseries'}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Area ---- */}
      <div>
        <p className="mb-2.5 text-sm font-medium text-gray-700">Area</p>
        <div className="relative">
          <select
            value={filters.area}
            onChange={(e) =>
              onChange({ ...filters, area: e.target.value })
            }
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
          >
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a.name} value={a.name}>
                {displayAreaName(a.name)} ({a.count})
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* ---- Rating ---- */}
      <div>
        <p className="mb-2.5 text-sm font-medium text-gray-700">{ratingFilterLabel}</p>
        <div className="relative">
          <select
            value={filters.rating}
            onChange={(e) =>
              onChange({ ...filters, rating: e.target.value as KHDARating | '' })
            }
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
          >
            <option value="">Any rating</option>
            {KHDA_RATINGS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* ---- Curriculum ---- */}
      <div>
        <p className="mb-2.5 text-sm font-medium text-gray-700">Curriculum</p>
        <div className="flex flex-wrap gap-2">
          {CURRICULA_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCurriculum(c)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                filters.curriculum.includes(c)
                  ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Fee Range ---- */}
      <div>
        <p className="mb-2.5 text-sm font-medium text-gray-700">Fee Range</p>
        <div className="space-y-1.5">
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
                className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition-all ${
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

      {/* ---- SEN Support ---- */}
      <div>
        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.hasSen}
              onChange={(e) =>
                onChange({ ...filters, hasSen: e.target.checked })
              }
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-[#FF6B35]" />
            <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            SEN Support
          </span>
        </label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page content (needs Suspense boundary for useSearchParams)
// ---------------------------------------------------------------------------

function SchoolsPageContent() {
  const { isSignedIn } = useAuth();
  const [wallOpen, setWallOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get('q') ?? '';
  const curriculumParam = searchParams.get('curriculum') ?? '';
  const areaParam = searchParams.get('area') ?? '';
  const emirateParam = searchParams.get('emirate') ?? '';

  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    emirate: (emirateParam === 'dubai' || emirateParam === 'abu_dhabi') ? emirateParam : '',
    curriculum: curriculumParam ? [curriculumParam] : [],
    area: areaParam,
  }));
  const [sort, setSort] = useState<SortOption>('rating');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchInput, setSearchInput] = useState(queryParam);
  const [page, setPage] = useState(1);
  const [loadedSchools, setLoadedSchools] = useState<School[]>([]);

  const { isSaved, toggleSave, isAtLocalLimit } = useSavedSchools();
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation, clearLocation } = useUserLocation();

  const isAISearch = queryParam.length > 0;
  const hasLocationContext = userLocation !== null;

  // Build sort options dynamically based on location context and emirate
  const dynamicSortOptions = BASE_SORT_OPTIONS.map(opt =>
    opt.value === 'rating' ? { ...opt, label: getRatingSortLabel(filters.emirate) } : opt
  );
  const sortOptions = hasLocationContext
    ? [...dynamicSortOptions, DISTANCE_SORT_OPTION]
    : dynamicSortOptions;

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
    setLoadedSchools([]);
  }, []);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
    setLoadedSchools([]);
  }, []);

  // Auto-switch to distance sort when location becomes active
  useEffect(() => {
    if (userLocation) {
      handleSortChange('distance');
    }
  }, [userLocation, handleSortChange]);

  // ---- Fetch areas for the filter dropdown (scoped by emirate) ----
  const areasQuery = useQuery<{ name: string; count: number }[]>({
    queryKey: ['school-areas', filters.emirate],
    queryFn: () => fetchAreas(filters.emirate || undefined),
    staleTime: 1000 * 60 * 30,
  });

  // ---- React Query: AI search ----
  const aiQuery = useQuery<SearchResponse>({
    queryKey: ['ai-search', queryParam, filters.type, userLocation?.lat, userLocation?.lng, filters.radiusKm],
    queryFn: () => aiSearch(queryParam, filters, userLocation, filters.radiusKm),
    enabled: isAISearch,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Location context from AI search response
  const aiLocationContext: LocationContext | undefined = aiQuery.data?.location_context;

  // ---- React Query: filtered list ----
  const listQuery = useQuery<SchoolListResponse>({
    queryKey: ['schools-list', filters, page, sort, userLocation?.lat, userLocation?.lng],
    queryFn: async () => {
      const data = await fetchSchools(filters, page, sort, userLocation);
      if (page === 1) {
        setLoadedSchools(data.schools);
      } else {
        setLoadedSchools((prev) => {
          const ids = new Set(prev.map((s) => s.id));
          return [...prev, ...data.schools.filter((s) => !ids.has(s.id))];
        });
      }
      return data;
    },
    enabled: !isAISearch,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const activeQuery = isAISearch ? aiQuery : listQuery;
  const schools: School[] = isAISearch
    ? (aiQuery.data?.schools ?? [])
    : loadedSchools;
  const total = isAISearch
    ? (aiQuery.data?.total ?? 0)
    : (listQuery.data?.total ?? 0);
  const aiExplanation = isAISearch ? aiQuery.data?.ai_explanation : undefined;
  const hasMore = !isAISearch && schools.length < total;

  const handleNewSearch = useCallback(() => {
    const q = searchInput.trim();
    if (!q) return;

    if (!isSignedIn) {
      setWallOpen(true);
      return;
    }

    router.push(`/schools?q=${encodeURIComponent(q)}`);
  }, [searchInput, router, isSignedIn]);

  const resetFilters = useCallback(() => {
    handleFiltersChange(DEFAULT_FILTERS);
  }, [handleFiltersChange]);

  const loadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-section-light)' }}>
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Search bar */}
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 transition-all focus-within:border-[#FF6B35]/40 focus-within:ring-2 focus-within:ring-[#FF6B35]/10">
            <Search className="size-4 flex-shrink-0 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNewSearch()}
              placeholder="Search schools, nurseries, areas..."
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              onClick={handleNewSearch}
              className="rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #FF6B35, #F59E0B)',
              }}
            >
              Search
            </button>
          </div>

          {/* Near Me button */}
          <button
            type="button"
            onClick={() => {
              if (hasLocationContext) {
                clearLocation();
                if (sort === 'distance') setSort('rating');
                handleFiltersChange({ ...filters, radiusKm: '' });
              } else {
                requestLocation();
              }
            }}
            disabled={locationLoading}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
              hasLocationContext
                ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                : 'border-gray-200 text-gray-600 hover:border-[#FF6B35]/40 hover:text-[#FF6B35]'
            }`}
          >
            {locationLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : hasLocationContext ? (
              <X className="size-4" />
            ) : (
              <Locate className="size-4" />
            )}
            <span className="hidden sm:inline">
              {locationLoading ? 'Locating...' : hasLocationContext ? 'Near Me' : 'Near Me'}
            </span>
          </button>

          {/* View toggle + mobile filter */}
          <div className="flex items-center gap-2">
            {/* Pill segmented control */}
            <div className="flex rounded-lg bg-gray-100 p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="size-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Map className="size-4" />
                Map
              </button>
            </div>

            {/* Mobile filter sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="mr-1 size-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto p-6">
                <SheetTitle className="sr-only">Filter schools</SheetTitle>
                <SearchFilters
                  filters={filters}
                  onChange={handleFiltersChange}
                  onReset={resetFilters}
                  areas={areasQuery.data ?? []}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* BODY                                                               */}
      {/* ================================================================== */}
      <div className="mx-auto flex max-w-7xl gap-6 px-3 py-4 sm:px-4 sm:py-6">
        {/* -- Sidebar Filters (desktop) -- */}
        <aside className="sticky top-20 hidden h-fit w-64 flex-shrink-0 lg:block">
          <div className="rounded-2xl bg-white p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <SearchFilters
              filters={filters}
              onChange={handleFiltersChange}
              onReset={resetFilters}
              areas={areasQuery.data ?? []}
            />
          </div>
        </aside>

        {/* -- Main content -- */}
        <main className="min-w-0 flex-1">
          {/* Results heading + sort control */}
          <div className="mb-3 sm:mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">
                {isAISearch
                  ? `Results for "${queryParam}"`
                  : 'All Schools & Nurseries'}
              </h1>
              {!activeQuery.isLoading && (
                <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
                  {total} {total === 1 ? 'result' : 'results'} found
                </p>
              )}
            </div>

            {/* Sort dropdown */}
            {!isAISearch && (
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <ArrowUpDown className="size-3.5 text-gray-400" />
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value as SortOption)}
                    className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-7 text-sm text-gray-700 focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* AI explanation card */}
          {aiExplanation && (
            <div className="relative mb-6 overflow-hidden rounded-2xl border border-[#FF6B35]/10 bg-gradient-to-br from-[#FF6B35]/5 via-white to-[#A855F7]/5 p-5">
              {/* Decorative blur orb */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FF6B35]/10 blur-2xl" />
              <div className="relative flex items-start gap-3">
                <div
                  className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #FBBF24)',
                  }}
                >
                  <Sparkles className="size-4 text-white" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-gray-900">
                    AI Insights
                  </p>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {aiExplanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Location context badge + radius filter */}
          {(hasLocationContext || aiLocationContext) && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {/* Context badge */}
              <div className="flex items-center gap-1.5 rounded-lg bg-[#FF6B35]/10 px-3 py-1.5 text-sm font-medium text-[#FF6B35]">
                <Navigation className="size-3.5" />
                {aiLocationContext?.place_name
                  ? `Showing results near ${aiLocationContext.place_name}`
                  : 'Showing results near you'}
              </div>

              {/* Radius filter buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Radius:</span>
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      handleFiltersChange({
                        ...filters,
                        radiusKm: filters.radiusKm === r ? '' : r,
                      });
                    }}
                    className={`rounded-md border px-2 py-1 text-xs font-medium transition-all ${
                      filters.radiusKm === r
                        ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location error */}
          {locationError && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              {locationError}
            </div>
          )}

          {/* Active filter pills */}
          {(filters.emirate ||
            filters.type ||
            filters.rating ||
            filters.curriculum.length > 0 ||
            filters.feeMin ||
            filters.feeMax ||
            filters.hasSen ||
            filters.area) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {filters.emirate && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-[#FF6B35]/10 text-[#FF6B35]"
                >
                  {filters.emirate === 'dubai' ? 'Dubai' : 'Abu Dhabi'}
                  <button
                    type="button"
                    onClick={() => handleFiltersChange({ ...filters, emirate: '', area: '' })}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {filters.type && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-[#FF6B35]/10 text-[#FF6B35]"
                >
                  {filters.type === 'school' ? 'Schools' : 'Nurseries'}
                  <button
                    type="button"
                    onClick={() => handleFiltersChange({ ...filters, type: '' })}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {filters.area && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-[#FF6B35]/10 text-[#FF6B35]"
                >
                  {filters.area}
                  <button
                    type="button"
                    onClick={() => handleFiltersChange({ ...filters, area: '' })}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {filters.rating && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-[#FF6B35]/10 text-[#FF6B35]"
                >
                  {filters.emirate === 'dubai' ? 'KHDA' : filters.emirate === 'abu_dhabi' ? 'ADEK' : 'Rating'}: {filters.rating}
                  <button
                    type="button"
                    onClick={() => handleFiltersChange({ ...filters, rating: '' })}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {filters.curriculum.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="gap-1 bg-[#FF6B35]/10 text-[#FF6B35]"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() =>
                      handleFiltersChange({
                        ...filters,
                        curriculum: filters.curriculum.filter((x) => x !== c),
                      })
                    }
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              {(filters.feeMin || filters.feeMax) && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-[#FF6B35]/10 text-[#FF6B35]"
                >
                  {filters.feeMin && filters.feeMax
                    ? `AED ${Number(filters.feeMin).toLocaleString()} - ${Number(filters.feeMax).toLocaleString()}`
                    : filters.feeMin
                      ? `From AED ${Number(filters.feeMin).toLocaleString()}`
                      : `Up to AED ${Number(filters.feeMax).toLocaleString()}`}
                  <button
                    type="button"
                    onClick={() =>
                      handleFiltersChange({ ...filters, feeMin: '', feeMax: '' })
                    }
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {filters.hasSen && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-[#FF6B35]/10 text-[#FF6B35]"
                >
                  SEN Support
                  <button
                    type="button"
                    onClick={() => handleFiltersChange({ ...filters, hasSen: false })}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* ---- Loading state ---- */}
          {activeQuery.isLoading && page === 1 && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SchoolCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* ---- Error state ---- */}
          {activeQuery.isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-medium text-red-700">
                Something went wrong loading results.
              </p>
              <p className="mt-1 text-sm text-red-500">
                Please try again or refine your search.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => activeQuery.refetch()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          )}

          {/* ---- Results: List view ---- */}
          {!(activeQuery.isLoading && page === 1) &&
            !activeQuery.isError &&
            viewMode === 'list' && (
              <>
                {schools.length === 0 ? (
                  <div className="rounded-2xl bg-white p-12 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
                    <Search className="mx-auto size-12 text-gray-300" />
                    <p className="mt-4 text-lg font-medium text-gray-700">
                      No schools found
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your filters or search with different keywords.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="mt-4"
                    >
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3 sm:space-y-4"
                  >
                    {schools.map((school) => (
                      <motion.div key={school.id} variants={staggerItem}>
                        <SchoolCard
                          school={school}
                          isSaved={isSaved(school.id)}
                          onToggleSave={toggleSave}
                          isAtLocalLimit={isAtLocalLimit}
                        />
                      </motion.div>
                    ))}

                    {/* Load More button */}
                    {hasMore && (
                      <div className="pt-4 text-center">
                        <button
                          onClick={loadMore}
                          disabled={listQuery.isFetching}
                          className="group relative inline-flex items-center gap-2 rounded-xl border-2 border-[#FF6B35]/30 px-8 py-3 text-sm font-semibold text-[#FF6B35] transition-all hover:border-[#FF6B35] hover:bg-[#FF6B35] hover:text-white disabled:opacity-50"
                        >
                          {listQuery.isFetching ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              Load More ({total - schools.length} remaining)
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            )}

          {/* ---- Results: Map view ---- */}
          {!(activeQuery.isLoading && page === 1) &&
            !activeQuery.isError &&
            viewMode === 'map' && (
              <div>
                {schools.length > 0 ? (
                  <MapView
                    schools={schools}
                    center={
                      aiLocationContext
                        ? { lat: aiLocationContext.lat, lng: aiLocationContext.lng, label: aiLocationContext.place_name }
                        : userLocation
                          ? { lat: userLocation.lat, lng: userLocation.lng, label: 'Your location' }
                          : undefined
                    }
                  />
                ) : (
                  <div className="flex h-[500px] items-center justify-center rounded-2xl bg-white" style={{ boxShadow: 'var(--shadow-card)' }}>
                    <div className="text-center">
                      <Map className="mx-auto size-12 text-gray-300" />
                      <p className="mt-4 text-lg font-medium text-gray-700">
                        No schools to show on map
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your filters.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
        </main>
      </div>

      <SignUpWallModal open={wallOpen} onClose={() => setWallOpen(false)} feature="ai-search" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported page with Suspense boundary for useSearchParams
// ---------------------------------------------------------------------------

export default function SchoolsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ background: 'var(--gradient-section-light)' }}>
          <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
            </div>
          </header>
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SchoolCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SchoolsPageContent />
    </Suspense>
  );
}
