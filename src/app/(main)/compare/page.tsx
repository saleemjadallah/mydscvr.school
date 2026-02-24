'use client';

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  Plus,
  ArrowRight,
  Sparkles,
  Star,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import type { School, KHDARating } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_SCHOOLS = 4;

const KHDA_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  Outstanding: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Very Good': { bg: 'bg-blue-100', text: 'text-blue-700' },
  Good: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Acceptable: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Weak: { bg: 'bg-red-100', text: 'text-red-700' },
  'Very Weak': { bg: 'bg-red-200', text: 'text-red-800' },
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

function feeLabel(school: School): string {
  if (school.fee_min != null && school.fee_max != null) {
    return `AED ${formatFee(school.fee_min)} – ${formatFee(school.fee_max)}`;
  }
  if (school.fee_min != null) return `From AED ${formatFee(school.fee_min)}`;
  if (school.fee_max != null) return `Up to AED ${formatFee(school.fee_max)}`;
  return '—';
}

// ---------------------------------------------------------------------------
// Autocomplete search hook
// ---------------------------------------------------------------------------

function useSchoolSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query.trim(), limit: '10' });
        const res = await fetch(`/api/schools?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to search');
        const data = await res.json();
        setResults(data.schools ?? []);
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return { query, setQuery, results, loading };
}

// ---------------------------------------------------------------------------
// SchoolSearchInput
// ---------------------------------------------------------------------------

function SchoolSearchInput({
  onSelect,
  selectedIds,
}: {
  onSelect: (school: School) => void;
  selectedIds: Set<string>;
}) {
  const { query, setQuery, results, loading } = useSchoolSearch();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-[#FF6B35] focus-within:ring-1 focus-within:ring-[#FF6B35]">
        <Search className="size-4 flex-shrink-0 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for a school to add..."
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        {loading && <Loader2 className="size-4 animate-spin text-gray-400" />}
      </div>

      {/* Dropdown */}
      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {results.length === 0 && !loading && (
            <p className="px-4 py-3 text-sm text-gray-500">No schools found</p>
          )}
          {results.map((school) => {
            const alreadySelected = selectedIds.has(school.id);
            return (
              <button
                key={school.id}
                type="button"
                disabled={alreadySelected}
                onClick={() => {
                  onSelect(school);
                  setQuery('');
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  alreadySelected
                    ? 'cursor-not-allowed bg-gray-50 text-gray-400'
                    : 'hover:bg-[#FF6B35]/5'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {school.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {school.area ?? 'Dubai'}
                    {school.curriculum?.length
                      ? ` · ${school.curriculum.join(', ')}`
                      : ''}
                  </p>
                </div>
                {alreadySelected ? (
                  <Badge variant="secondary" className="text-[10px]">
                    Added
                  </Badge>
                ) : (
                  <Plus className="size-4 flex-shrink-0 text-[#FF6B35]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Selected school chip
// ---------------------------------------------------------------------------

function SelectedSchoolChip({
  school,
  onRemove,
}: {
  school: School;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {school.name}
        </p>
        <p className="truncate text-xs text-gray-500">{school.area ?? 'Dubai'}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="flex-shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
        aria-label={`Remove ${school.name}`}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature row helper
// ---------------------------------------------------------------------------

function FeatureCell({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="mx-auto size-5 text-emerald-500" />
  ) : (
    <XCircle className="mx-auto size-5 text-gray-300" />
  );
}

// ---------------------------------------------------------------------------
// Comparison Table
// ---------------------------------------------------------------------------

function ComparisonTable({ schools }: { schools: School[] }) {
  const colCount = schools.length;

  const rows: { label: string; render: (s: School) => React.ReactNode }[] = [
    {
      label: 'Area',
      render: (s) => (
        <span className="flex items-center justify-center gap-1 text-sm text-gray-700">
          <MapPin className="size-3.5 text-gray-400" />
          {s.area ?? '—'}
        </span>
      ),
    },
    {
      label: 'Curriculum',
      render: (s) => (
        <div className="flex flex-wrap justify-center gap-1">
          {s.curriculum?.length ? (
            s.curriculum.map((c) => (
              <Badge
                key={c}
                variant="outline"
                className="text-[10px] px-1.5 py-0 text-gray-600"
              >
                {c}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      ),
    },
    {
      label: 'KHDA Rating',
      render: (s) => {
        if (!s.khda_rating) return <span className="text-sm text-gray-400">—</span>;
        const colors = KHDA_COLOR_MAP[s.khda_rating] ?? {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
        };
        return (
          <Badge
            variant="secondary"
            className={`${colors.bg} ${colors.text} border-0 text-xs`}
          >
            {s.khda_rating}
          </Badge>
        );
      },
    },
    {
      label: 'Annual Fees',
      render: (s) => (
        <span className="text-sm font-semibold text-gray-900">
          {feeLabel(s)}
        </span>
      ),
    },
    {
      label: 'Google Rating',
      render: (s) =>
        s.google_rating != null ? (
          <span className="flex items-center justify-center gap-1 text-sm">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-gray-700">
              {Number(s.google_rating).toFixed(1)}
            </span>
            {s.google_review_count != null && (
              <span className="text-gray-400">
                ({Number(s.google_review_count).toLocaleString()})
              </span>
            )}
          </span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        ),
    },
    {
      label: 'Gender',
      render: (s) => (
        <span className="text-sm capitalize text-gray-700">{s.gender}</span>
      ),
    },
    {
      label: 'SEN Support',
      render: (s) => <FeatureCell value={s.has_sen_support} />,
    },
    {
      label: 'Transport',
      render: (s) => <FeatureCell value={s.has_transport} />,
    },
    {
      label: 'Swimming Pool',
      render: (s) => <FeatureCell value={s.has_swimming_pool} />,
    },
    {
      label: 'Sports Facilities',
      render: (s) => <FeatureCell value={s.has_sports_facilities} />,
    },
    {
      label: 'Arts Program',
      render: (s) => <FeatureCell value={s.has_arts_program} />,
    },
    {
      label: 'After School',
      render: (s) => <FeatureCell value={s.has_after_school} />,
    },
    {
      label: 'Boarding',
      render: (s) => <FeatureCell value={s.has_boarding} />,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr>
            <th className="w-40 border-b border-gray-200 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500" />
            {schools.map((s) => (
              <th
                key={s.id}
                className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-center"
              >
                <Link
                  href={`/schools/${s.slug}`}
                  className="text-sm font-bold text-gray-900 hover:text-[#FF6B35]"
                >
                  {s.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
            >
              <td className="border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-600">
                {row.label}
              </td>
              {schools.map((s) => (
                <td
                  key={s.id}
                  className="border-b border-gray-100 px-4 py-3 text-center"
                >
                  {row.render(s)}
                </td>
              ))}
              {/* Fill empty columns if less than MAX_SCHOOLS */}
              {Array.from({ length: MAX_SCHOOLS - colCount }).map((_, j) => (
                <td
                  key={`empty-${j}`}
                  className="border-b border-gray-100 px-4 py-3"
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ComparePage() {
  const [selected, setSelected] = useState<School[]>([]);
  const [comparisonSchools, setComparisonSchools] = useState<School[]>([]);
  const [aiComparison, setAiComparison] = useState<string>('');
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string>('');

  const selectedIds = new Set(selected.map((s) => s.id));

  const addSchool = useCallback(
    (school: School) => {
      if (selected.length >= MAX_SCHOOLS) return;
      if (selectedIds.has(school.id)) return;
      setSelected((prev) => [...prev, school]);
    },
    [selected, selectedIds]
  );

  const removeSchool = useCallback((id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  }, []);

  async function handleCompare() {
    if (selected.length < 2) return;
    setComparing(true);
    setError('');
    setAiComparison('');
    setComparisonSchools([]);

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school_ids: selected.map((s) => s.id) }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? 'Comparison failed'
        );
      }

      const data = await res.json();
      setComparisonSchools(data.schools ?? selected);
      setAiComparison(data.ai_comparison ?? '');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Something went wrong');
    } finally {
      setComparing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================================================================ */}
      {/* Header area                                                      */}
      {/* ================================================================ */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Compare Schools
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Add up to {MAX_SCHOOLS} schools side by side. Our AI will generate a
            detailed comparison to help you decide.
          </p>

          {/* Search input */}
          <div className="mt-6">
            {selected.length < MAX_SCHOOLS ? (
              <SchoolSearchInput onSelect={addSchool} selectedIds={selectedIds} />
            ) : (
              <p className="text-sm text-gray-500">
                Maximum of {MAX_SCHOOLS} schools reached. Remove one to add
                another.
              </p>
            )}
          </div>

          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {selected.map((school) => (
                <SelectedSchoolChip
                  key={school.id}
                  school={school}
                  onRemove={() => removeSchool(school.id)}
                />
              ))}
            </div>
          )}

          {/* Compare button */}
          <div className="mt-6 flex items-center gap-4">
            <Button
              disabled={selected.length < 2 || comparing}
              onClick={handleCompare}
              className="bg-[#FF6B35] text-white hover:bg-[#e55a2a] disabled:opacity-50"
            >
              {comparing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 size-4" />
                  Compare {selected.length} School{selected.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
            {selected.length < 2 && selected.length > 0 && (
              <p className="text-sm text-gray-400">
                Add at least one more school to compare
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Comparison results                                               */}
      {/* ================================================================ */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="font-medium text-red-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompare}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading skeleton */}
        {comparing && (
          <div className="space-y-6">
            <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
          </div>
        )}

        {/* AI comparison text */}
        {!comparing && aiComparison && (
          <div className="mb-8 rounded-xl border border-[#FF6B35]/20 bg-[#FF6B35]/5 p-5">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="size-5 text-[#FF6B35]" />
              <span className="text-sm font-semibold text-[#FF6B35]">
                AI Comparison
              </span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-li:marker:text-[#FF6B35]">
              <ReactMarkdown>{aiComparison}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Comparison table */}
        {!comparing && comparisonSchools.length >= 2 && (
          <div className="rounded-xl border bg-white shadow-sm">
            <ComparisonTable schools={comparisonSchools} />
          </div>
        )}

        {/* Empty state */}
        {!comparing && comparisonSchools.length === 0 && !error && (
          <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#FF6B35]/10">
              <ArrowRight className="size-8 text-[#FF6B35]" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Ready to compare?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Search and select 2 to {MAX_SCHOOLS} schools above, then click
              &quot;Compare&quot; to see a detailed side-by-side comparison
              powered by AI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
