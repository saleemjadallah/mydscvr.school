'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';
import { MAX_COMPARE_SCHOOLS } from '@/lib/constants';
import { compareSchools } from '@/lib/api';
import SignUpWallModal from '@/components/SignUpWallModal';
import type { School, CompareResponse } from '@/types';

import CompareHero from './_components/CompareHero';
import SchoolSlotDock from './_components/SchoolSlotDock';
import SchoolSearchPanel from './_components/SchoolSearchPanel';
import CompareButton from './_components/CompareButton';
import ComparisonResults from './_components/ComparisonResults';
import CompareLoadingSkeleton from './_components/CompareLoadingSkeleton';
import CompareEmptyState from './_components/CompareEmptyState';

export default function ComparePage() {
  return (
    <Suspense fallback={<ComparePageFallback />}>
      <ComparePageInner />
    </Suspense>
  );
}

function ComparePageFallback() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <CompareHero />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <CompareLoadingSkeleton />
      </div>
    </div>
  );
}

function ComparePageInner() {
  const { isSignedIn } = useAuth();
  const [wallOpen, setWallOpen] = useState(false);

  // ── URL state via nuqs ──
  const [schoolsParam, setSchoolsParam] = useQueryState(
    'schools',
    parseAsString.withDefault('')
  );

  // ── Local state ──
  const [selected, setSelected] = useState<School[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string>('');
  const initialLoadDone = useRef(false);

  const selectedIds = new Set(selected.map((s) => s.id));

  // ── Auto-load from URL slugs on mount ──
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    if (!isSignedIn) return;

    const slugs = schoolsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (slugs.length >= 2) {
      autoLoadFromSlugs(slugs);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function autoLoadFromSlugs(slugs: string[]) {
    setComparing(true);
    setError('');
    setResult(null);

    try {
      const data = await compareSchools({ school_slugs: slugs });

      // Populate selected schools from response
      setSelected(
        data.schools.map((s) => s as unknown as School)
      );
      setResult(data);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to load comparison');
    } finally {
      setComparing(false);
    }
  }

  // ── Add school ──
  const addSchool = useCallback(
    (school: School) => {
      if (selected.length >= MAX_COMPARE_SCHOOLS) return;
      if (selectedIds.has(school.id)) return;
      setSelected((prev) => [...prev, school]);
    },
    [selected, selectedIds]
  );

  // ── Remove school ──
  const removeSchool = useCallback((id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
    setResult(null);
  }, []);

  // ── Handle compare ──
  async function handleCompare() {
    if (selected.length < 2) return;

    if (!isSignedIn) {
      setWallOpen(true);
      return;
    }

    setComparing(true);
    setError('');
    setResult(null);

    try {
      const data = await compareSchools({
        school_ids: selected.map((s) => s.id),
      });

      setResult(data);

      // Update URL with slugs for sharing
      const slugs = data.schools.map((s) => s.slug).join(',');
      setSchoolsParam(slugs);
    } catch (err: unknown) {
      const message = (err as Error).message ?? 'Comparison failed';
      setError(message);
      if (message.includes('wait')) {
        toast.error(message);
      }
    } finally {
      setComparing(false);
    }
  }

  // ── Handle suggestion chips ──
  function handleSuggestion(slugs: string[]) {
    if (!isSignedIn) {
      setWallOpen(true);
      return;
    }
    setSchoolsParam(slugs.join(','));
    autoLoadFromSlugs(slugs);
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Cinematic Hero ── */}
      <CompareHero />

      {/* ── School Selection Dock — overlapping hero ── */}
      <div className="relative z-10 mx-auto -mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl glass-dark p-5 shadow-xl" style={{ background: 'rgba(10, 22, 40, 0.85)', backdropFilter: 'blur(20px)' }}>
          <SchoolSlotDock
            schools={selected}
            onRemove={removeSchool}
            onOpenSearch={() => setSearchOpen(true)}
          />

          {/* Search + Compare row */}
          <div className="relative mt-4 flex items-center gap-3">
            <div className="relative flex-1">
              {selected.length < MAX_COMPARE_SCHOOLS ? (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/40 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <span className="text-white/30">Search for a school to add...</span>
                </button>
              ) : (
                <p className="text-xs text-white/40">
                  Maximum of {MAX_COMPARE_SCHOOLS} schools. Remove one to add another.
                </p>
              )}

              <SchoolSearchPanel
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                onSelect={(school) => {
                  addSchool(school);
                  setSearchOpen(false);
                }}
                selectedIds={selectedIds}
              />
            </div>

            <CompareButton
              count={selected.length}
              loading={comparing}
              onClick={handleCompare}
            />
          </div>

          {/* Hint */}
          {selected.length > 0 && selected.length < 2 && (
            <p className="mt-2 text-center text-xs text-white/30">
              Add at least one more school to compare
            </p>
          )}
        </div>
      </div>

      {/* ── Results Area ── */}
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Error state */}
        {error && !comparing && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={handleCompare}
              className="mt-3 rounded-lg bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {comparing && <CompareLoadingSkeleton />}

        {/* Comparison results */}
        {!comparing && result && result.schools.length >= 2 && (
          <ComparisonResults data={result} />
        )}

        {/* Empty state */}
        {!comparing && !result && !error && (
          <CompareEmptyState onSuggestion={handleSuggestion} />
        )}
      </div>

      <SignUpWallModal open={wallOpen} onClose={() => setWallOpen(false)} feature="compare" />
    </div>
  );
}
