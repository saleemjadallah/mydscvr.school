'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SimilarSchool {
  id: string;
  slug: string;
  name: string;
  area: string | null;
  khda_rating: string | null;
  google_rating: number | null;
  fee_min: number | null;
  fee_max: number | null;
  curriculum: string[];
  google_photos: string[] | string | null;
  similarity: number;
}

const KHDA_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  Outstanding: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Very Good': { bg: 'bg-blue-100', text: 'text-blue-700' },
  Good: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Acceptable: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Weak: { bg: 'bg-red-100', text: 'text-red-700' },
};

function resolvePhotos(raw: string[] | string | null | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatFee(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount);
}

async function fetchSimilar(slug: string): Promise<SimilarSchool[]> {
  const res = await fetch(`/api/schools/${slug}/similar`);
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export default function SimilarSchools({ slug }: { slug: string }) {
  const { data: schools, isLoading, isError } = useQuery<SimilarSchool[]>({
    queryKey: ['similar-schools', slug],
    queryFn: () => fetchSimilar(slug),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-gray-900">
          Similar Schools
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-3 rounded-lg bg-gray-50 p-3"
            >
              <div className="size-10 flex-shrink-0 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-gray-200" />
                <div className="h-2.5 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !schools || schools.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-gray-900">
        Similar Schools
      </h3>
      <div className="space-y-2">
        {schools.slice(0, 5).map((school) => {
          const photos = resolvePhotos(school.google_photos);
          const khdaColors = school.khda_rating
            ? KHDA_COLOR_MAP[school.khda_rating]
            : null;

          return (
            <Link
              key={school.id}
              href={`/schools/${school.slug}`}
              className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-gray-50"
            >
              {/* Thumbnail */}
              {photos[0] ? (
                <Image
                  src={photos[0]}
                  alt={school.name}
                  width={44}
                  height={44}
                  className="size-11 flex-shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#FF6B35]/10">
                  <BookOpen className="size-5 text-[#FF6B35]" />
                </div>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {school.name}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                  {school.area && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="size-3" />
                      {school.area}
                    </span>
                  )}
                  {school.google_rating != null && (
                    <span className="flex items-center gap-0.5">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {school.google_rating.toFixed(1)}
                    </span>
                  )}
                </div>
                {khdaColors && (
                  <Badge
                    className={`${khdaColors.bg} ${khdaColors.text} mt-1 border-0 px-1.5 py-0 text-[10px]`}
                  >
                    {school.khda_rating}
                  </Badge>
                )}
              </div>

              {/* Fee */}
              {school.fee_min != null && (
                <p className="flex-shrink-0 text-[10px] text-gray-400">
                  From AED {formatFee(school.fee_min)}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
