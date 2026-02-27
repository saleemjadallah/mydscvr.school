'use client';

export const dynamic = "force-dynamic";

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronDown,
  ArrowUpDown,
  Loader2,
  Navigation,
  Locate,
  Baby,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SchoolCard from '@/components/SchoolCard';
import SignUpWallModal from '@/components/SignUpWallModal';
import { useSavedSchools } from '@/hooks/useSavedSchools';
import { useUserLocation } from '@/hooks/useUserLocation';
import { displayAreaName } from '@/lib/dubai-areas';
import type {
  School,
  SearchResponse,
  SchoolListResponse,
  KHDARating,
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

const FEE_RANGES = [
  { label: 'Under AED 20,000', min: '', max: '20000' },
  { label: 'AED 20,000 - 40,000', min: '20000', max: '40000' },
  { label: 'AED 40,000 - 60,000', min: '40000', max: '60000' },
  { label: 'AED 60,000+', min: '60000', max: '' },
];

function getNurseryRatingSortLabel(emirate: string) {
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
  area: string;
  rating: KHDARating | '';
  feeMin: string;
  feeMax: string;
  hasSen: boolean;
  radiusKm: number | '';
}

const DEFAULT_FILTERS: Filters = {
  emirate: '',
  area: '',
  rating: '',
  feeMin: '',
  feeMax: '',
  hasSen: false,
  radiusKm: '',
};

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function aiSearch(query: string): Promise<SearchResponse> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      filters: { type: 'nursery' },
    }),
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

async function fetchNurseries(
  filters: Filters,
  page: number,
  sort: SortOption,
  location?: { lat: number; lng: number } | null,
): Promise<SchoolListResponse> {
  const params = new URLSearchParams();
  params.set('type', 'nursery');
  if (filters.emirate) params.set('emirate', filters.emirate);
  if (filters.area) params.set('area', filters.area);
  if (filters.rating) params.set('rating', filters.rating);
  if (filters.feeMin) params.set('fee_min', filters.feeMin);
  if (filters.feeMax) params.set('fee_max', filters.feeMax);
  if (filters.hasSen) params.set('has_sen', 'true');
  if (location) {
    params.set('lat', String(location.lat));
    params.set('lng', String(location.lng));
  }
  if (filters.radiusKm) params.set('radius_km', String(filters.radiusKm));
  params.set('page', String(page));
  params.set('limit', '20');
  params.set('sort', sort);

  const res = await fetch(`/api/schools?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch nurseries');
  return res.json();
}

async function fetchNurseryAreas(emirate?: string): Promise<{ name: string; count: number }[]> {
  const params = new URLSearchParams();
  if (emirate) params.set('emirate', emirate);
  // We want nursery-type areas only, but the areas API returns all types.
  // The area dropdown is still useful even without type scoping.
  const res = await fetch(`/api/schools/areas?${params.toString()}`);
  if (!res.ok) return [];
  return res.json();
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function NurseryCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white overflow-hidden sm:overflow-visible sm:p-5 animate-pulse" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex flex-col sm:flex-row sm:gap-5">
        <div className="h-40 w-full bg-gray-200 sm:size-32 sm:flex-shrink-0 sm:rounded-xl sm:h-32" />
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
        <div className="hidden sm:flex flex-col items-end justify-between">
          <div className="h-8 w-24 rounded bg-gray-200" />
          <div className="h-8 w-20 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar Filters
// ---------------------------------------------------------------------------

function NurseryFilters({
  filters,
  onChange,
  onReset,
  mobile,
  onClose,
  areas,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  mobile?: boolean;
  onClose?: () => void;
  areas: { name: string; count: number }[];
}) {
  const ratingLabel = filters.emirate === 'dubai' ? 'KHDA Rating'
    : filters.emirate === 'abu_dhabi' ? 'ADEK Rating'
    : 'Inspection Rating';

  const activeCount =
    (filters.emirate ? 1 : 0) +
    (filters.area ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    (filters.feeMin || filters.feeMax ? 1 : 0) +
    (filters.hasSen ? 1 : 0);

  return (
    <aside
      className={
        mobile
          ? 'fixed inset-0 z-50 overflow-y-auto bg-white p-6'
          : 'sticky top-4 hidden w-64 flex-shrink-0 lg:block'
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-[#FF6B35] hover:underline"
            >
              Clear all ({activeCount})
            </button>
          )}
          {mobile && onClose && (
            <button type="button" onClick={onClose}>
              <X className="size-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Emirate */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Emirate</p>
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

        {/* Area */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Area</p>
          <div className="relative">
            <select
              value={filters.area}
              onChange={(e) => onChange({ ...filters, area: e.target.value })}
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

        {/* Rating */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">{ratingLabel}</p>
          <div className="relative">
            <select
              value={filters.rating}
              onChange={(e) =>
                onChange({
                  ...filters,
                  rating: e.target.value as KHDARating | '',
                })
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

        {/* Fee Range */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Fee Range</p>
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
                  className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
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

        {/* SEN Support */}
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

      {mobile && (
        <Button
          onClick={onClose}
          className="mt-6 w-full bg-[#FF6B35] text-white hover:bg-[#e55a2a]"
        >
          Apply Filters
        </Button>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Page Content
// ---------------------------------------------------------------------------

function NurseriesPageContent() {
  const { isSignedIn } = useAuth();
  const [wallOpen, setWallOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get('q') ?? '';

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>('rating');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(queryParam);
  const [page] = useState(1);

  const { isSaved, toggleSave } = useSavedSchools();
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation, clearLocation } = useUserLocation();

  const isAISearch = queryParam.length > 0;
  const hasLocationContext = userLocation !== null;

  // Build sort options dynamically based on location context and emirate
  const dynamicSortOptions = BASE_SORT_OPTIONS.map(opt =>
    opt.value === 'rating' ? { ...opt, label: getNurseryRatingSortLabel(filters.emirate) } : opt
  );
  const sortOptions = hasLocationContext
    ? [...dynamicSortOptions, DISTANCE_SORT_OPTION]
    : dynamicSortOptions;

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSort(newSort);
  }, []);

  // Auto-switch to distance sort when location becomes active
  useEffect(() => {
    if (userLocation) {
      handleSortChange('distance');
    }
  }, [userLocation, handleSortChange]);

  // Fetch areas scoped by emirate
  const areasQuery = useQuery<{ name: string; count: number }[]>({
    queryKey: ['nursery-areas', filters.emirate],
    queryFn: () => fetchNurseryAreas(filters.emirate || undefined),
    staleTime: 1000 * 60 * 30,
  });

  const aiQuery = useQuery<SearchResponse>({
    queryKey: ['nursery-ai-search', queryParam],
    queryFn: () => aiSearch(queryParam),
    enabled: isAISearch,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const listQuery = useQuery<SchoolListResponse>({
    queryKey: ['nurseries-list', filters, page, sort, userLocation?.lat, userLocation?.lng],
    queryFn: () => fetchNurseries(filters, page, sort, userLocation),
    enabled: !isAISearch,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const activeQuery = isAISearch ? aiQuery : listQuery;
  const schools: School[] = isAISearch
    ? (aiQuery.data?.schools ?? [])
    : (listQuery.data?.schools ?? []);
  const total = isAISearch
    ? (aiQuery.data?.total ?? 0)
    : (listQuery.data?.total ?? 0);
  const aiExplanation = isAISearch ? aiQuery.data?.ai_explanation : undefined;

  const handleNewSearch = useCallback(() => {
    const q = searchInput.trim();
    if (!q) return;

    if (!isSignedIn) {
      setWallOpen(true);
      return;
    }

    router.push(`/nurseries?q=${encodeURIComponent(q)}`);
  }, [searchInput, router, isSignedIn]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================================================================ */}
      {/* Header                                                           */}
      {/* ================================================================ */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <Baby className="size-5 text-[#FF6B35]" />
            <span className="text-lg font-bold text-gray-900">Nurseries</span>
          </div>

          {/* Search bar */}
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <Search className="size-4 flex-shrink-0 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNewSearch()}
              placeholder="Search nurseries..."
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <Button
              size="sm"
              onClick={handleNewSearch}
              className="bg-[#FF6B35] text-white hover:bg-[#e55a2a]"
            >
              Search
            </Button>
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
              {locationLoading ? 'Locating...' : 'Near Me'}
            </span>
          </button>

          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="mr-1 size-4" />
            Filters
          </Button>
        </div>
      </header>

      {/* ================================================================ */}
      {/* Body                                                             */}
      {/* ================================================================ */}
      <div className="mx-auto flex max-w-7xl gap-6 px-3 py-4 sm:px-4 sm:py-6">
        {/* Sidebar */}
        <NurseryFilters
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          areas={areasQuery.data ?? []}
        />

        {/* Mobile filters overlay */}
        {mobileFiltersOpen && (
          <NurseryFilters
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            mobile
            onClose={() => setMobileFiltersOpen(false)}
            areas={areasQuery.data ?? []}
          />
        )}

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Results heading + sort control */}
          <div className="mb-3 sm:mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">
                {isAISearch
                  ? `Nursery results for "${queryParam}"`
                  : filters.emirate === 'dubai' ? 'Nurseries in Dubai'
                  : filters.emirate === 'abu_dhabi' ? 'Nurseries in Abu Dhabi'
                  : 'All Nurseries'}
              </h1>
              {!activeQuery.isLoading && (
                <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
                  {total} {total === 1 ? 'nursery' : 'nurseries'} found
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

          {/* AI explanation */}
          {aiExplanation && (
            <div className="mb-6 rounded-xl border border-[#FF6B35]/20 bg-[#FF6B35]/5 p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <Sparkles className="size-4 text-[#FF6B35]" />
                <span className="text-sm font-semibold text-[#FF6B35]">
                  AI Insights
                </span>
              </div>
              <p className="text-sm leading-relaxed text-gray-700">
                {aiExplanation}
              </p>
            </div>
          )}

          {/* Location context badge + radius filter */}
          {hasLocationContext && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-[#FF6B35]/10 px-3 py-1.5 text-sm font-medium text-[#FF6B35]">
                <Navigation className="size-3.5" />
                Showing nurseries near you
              </div>

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
            filters.area ||
            filters.rating ||
            filters.feeMin ||
            filters.feeMax ||
            filters.hasSen) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {filters.emirate && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-[#FF6B35]/10 text-[#FF6B35]"
                >
                  {filters.emirate === 'dubai' ? 'Dubai' : 'Abu Dhabi'}
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, emirate: '', area: '' })}
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
                    onClick={() => setFilters({ ...filters, area: '' })}
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
                    onClick={() => setFilters({ ...filters, rating: '' })}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
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
                      setFilters({ ...filters, feeMin: '', feeMax: '' })
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
                    onClick={() => setFilters({ ...filters, hasSen: false })}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Loading */}
          {activeQuery.isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <NurseryCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {activeQuery.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-medium text-red-700">
                Something went wrong loading nurseries.
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

          {/* Results */}
          {!activeQuery.isLoading && !activeQuery.isError && (
            <>
              {schools.length === 0 ? (
                <div className="rounded-xl border bg-white p-12 text-center">
                  <Baby className="mx-auto size-12 text-gray-300" />
                  <p className="mt-4 text-lg font-medium text-gray-700">
                    No nurseries found
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
                <div className="space-y-3 sm:space-y-4">
                  {schools.map((school) => (
                    <SchoolCard
                      key={school.id}
                      school={school}
                      isSaved={isSaved(school.id)}
                      onToggleSave={toggleSave}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <SignUpWallModal open={wallOpen} onClose={() => setWallOpen(false)} feature="ai-search" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported page with Suspense boundary
// ---------------------------------------------------------------------------

export default function NurseriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <header className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
            </div>
          </header>
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <NurseryCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <NurseriesPageContent />
    </Suspense>
  );
}
