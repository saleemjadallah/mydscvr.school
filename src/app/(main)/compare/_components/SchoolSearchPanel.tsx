'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Search, Loader2, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { resolvePhoto } from '@/lib/school-utils';
import type { School } from '@/types';

interface SchoolSearchPanelProps {
  open: boolean;
  onClose: () => void;
  onSelect: (school: School) => void;
  selectedIds: Set<string>;
}

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

export default function SchoolSearchPanel({
  open,
  onClose,
  onSelect,
  selectedIds,
}: SchoolSearchPanelProps) {
  const { query, setQuery, results, loading } = useSchoolSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setQuery('');
    }
  }, [open, setQuery]);

  // Desktop inline dropdown
  const content = (
    <div className="flex h-full flex-col">
      {/* Search input */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 md:border-gray-200">
        <Search className="h-5 w-5 flex-shrink-0 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a school..."
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none md:text-gray-900"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-100 md:hidden"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto">
        {query.trim().length < 2 && (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            Type at least 2 characters to search
          </p>
        )}

        {query.trim().length >= 2 && results.length === 0 && !loading && (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            No schools found
          </p>
        )}

        {results.map((school) => {
          const alreadySelected = selectedIds.has(school.id);
          const photo = resolvePhoto(school.google_photos);

          return (
            <button
              key={school.id}
              type="button"
              disabled={alreadySelected}
              onClick={() => {
                onSelect(school);
                setQuery('');
                onClose();
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                alreadySelected
                  ? 'cursor-not-allowed bg-gray-50 opacity-50'
                  : 'hover:bg-[#FF6B35]/5'
              }`}
            >
              {/* Photo thumbnail */}
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {photo ? (
                  <Image
                    src={photo}
                    alt={school.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-300">
                    {school.name.charAt(0)}
                  </div>
                )}
              </div>

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
                <Plus className="h-4 w-4 flex-shrink-0 text-[#FF6B35]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Mobile: full-screen Sheet
  return (
    <>
      {/* Mobile Sheet */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0" showCloseButton={false}>
            <SheetHeader className="sr-only">
              <SheetTitle>Search Schools</SheetTitle>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: dropdown panel */}
      {open && (
        <div className="hidden md:block">
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[400px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
