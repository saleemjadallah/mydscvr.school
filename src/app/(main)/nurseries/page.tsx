'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronDown,
  Baby,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SchoolCard from '@/components/SchoolCard';
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Filters {
  rating: KHDARating | '';
  feeMin: string;
  feeMax: string;
  hasSen: boolean;
}

const DEFAULT_FILTERS: Filters = {
  rating: '',
  feeMin: '',
  feeMax: '',
  hasSen: false,
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
  page: number
): Promise<SchoolListResponse> {
  const params = new URLSearchParams();
  params.set('type', 'nursery');
  if (filters.rating) params.set('rating', filters.rating);
  if (filters.feeMin) params.set('fee_min', filters.feeMin);
  if (filters.feeMax) params.set('fee_max', filters.feeMax);
  if (filters.hasSen) params.set('has_sen', 'true');
  params.set('page', String(page));
  params.set('limit', '20');
  params.set('sort', 'rating');

  const res = await fetch(`/api/schools?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch nurseries');
  return res.json();
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function NurseryCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border bg-white p-4 shadow-sm animate-pulse">
      <div className="size-28 flex-shrink-0 rounded-lg bg-gray-200" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-5 w-48 rounded bg-gray-200" />
        <div className="h-3 w-32 rounded bg-gray-200" />
        <div className="h-3 w-40 rounded bg-gray-200" />
        <div className="mt-auto h-8 w-full rounded bg-gray-100" />
      </div>
      <div className="flex flex-col items-end justify-between">
        <div className="h-8 w-24 rounded bg-gray-200" />
        <div className="h-8 w-20 rounded bg-gray-200" />
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
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const activeCount =
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
        {/* KHDA Rating */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">KHDA Rating</p>
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
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get('q') ?? '';

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(queryParam);
  const [page] = useState(1);

  const isAISearch = queryParam.length > 0;

  const aiQuery = useQuery<SearchResponse>({
    queryKey: ['nursery-ai-search', queryParam],
    queryFn: () => aiSearch(queryParam),
    enabled: isAISearch,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const listQuery = useQuery<SchoolListResponse>({
    queryKey: ['nurseries-list', filters, page],
    queryFn: () => fetchNurseries(filters, page),
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
    router.push(`/nurseries?q=${encodeURIComponent(q)}`);
  }, [searchInput, router]);

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
              placeholder="Search nurseries in Dubai..."
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
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Sidebar */}
        <NurseryFilters
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
        />

        {/* Mobile filters overlay */}
        {mobileFiltersOpen && (
          <NurseryFilters
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            mobile
            onClose={() => setMobileFiltersOpen(false)}
          />
        )}

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Results heading */}
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {isAISearch
                  ? `Nursery results for "${queryParam}"`
                  : 'All Nurseries in Dubai'}
              </h1>
              {!activeQuery.isLoading && (
                <p className="mt-0.5 text-sm text-gray-500">
                  {total} {total === 1 ? 'nursery' : 'nurseries'} found
                </p>
              )}
            </div>
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

          {/* Active filter pills */}
          {(filters.rating ||
            filters.feeMin ||
            filters.feeMax ||
            filters.hasSen) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {filters.rating && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-[#FF6B35]/10 text-[#FF6B35]"
                >
                  KHDA: {filters.rating}
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
                <div className="space-y-4">
                  {schools.map((school) => (
                    <SchoolCard key={school.id} school={school} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
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
