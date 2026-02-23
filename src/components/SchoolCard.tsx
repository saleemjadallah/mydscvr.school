"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, BookOpen, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { School, KHDARating } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const KHDA_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  Outstanding: { bg: "bg-emerald-100", text: "text-emerald-700" },
  "Very Good": { bg: "bg-blue-100", text: "text-blue-700" },
  Good: { bg: "bg-yellow-100", text: "text-yellow-700" },
  Acceptable: { bg: "bg-orange-100", text: "text-orange-700" },
  Weak: { bg: "bg-red-100", text: "text-red-700" },
  "Very Weak": { bg: "bg-red-200", text: "text-red-800" },
};

function formatFee(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount);
}

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SchoolCardProps {
  school: Pick<
    School,
    | "id"
    | "slug"
    | "name"
    | "type"
    | "area"
    | "curriculum"
    | "khda_rating"
    | "fee_min"
    | "fee_max"
    | "google_rating"
    | "google_review_count"
    | "google_photos"
    | "ai_summary"
    | "has_sen_support"
    | "is_featured"
  >;
}

export default function SchoolCard({ school }: SchoolCardProps) {
  const photos = resolvePhotos(school.google_photos as string[] | string | null);
  const heroPhoto = photos[0] ?? null;
  const khdaColors = school.khda_rating
    ? KHDA_COLOR_MAP[school.khda_rating] ?? { bg: "bg-gray-100", text: "text-gray-700" }
    : null;

  return (
    <Link
      href={`/schools/${school.slug}`}
      className="group relative flex gap-4 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* ---- Save / Heart icon ---- */}
      <button
        type="button"
        aria-label="Save school"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // TODO: implement save/bookmark
        }}
        className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#FF6B35]"
      >
        <Heart className="size-5" />
      </button>

      {/* ---- Left: Photo ---- */}
      <div className="flex-shrink-0">
        {heroPhoto ? (
          <Image
            src={heroPhoto}
            alt={school.name}
            width={112}
            height={112}
            className="size-28 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-28 items-center justify-center rounded-lg bg-[#FF6B35]/10">
            <BookOpen className="size-10 text-[#FF6B35]" />
          </div>
        )}
      </div>

      {/* ---- Center: Details ---- */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {school.is_featured && (
            <Badge className="bg-[#FF6B35] text-white text-[10px] px-1.5 py-0">
              Featured
            </Badge>
          )}
          {school.khda_rating && khdaColors && (
            <Badge
              variant="secondary"
              className={`${khdaColors.bg} ${khdaColors.text} border-0 text-[10px] px-1.5 py-0`}
            >
              KHDA: {school.khda_rating}
            </Badge>
          )}
        </div>

        {/* School name */}
        <h3 className="truncate text-base font-bold text-gray-900 group-hover:text-[#FF6B35]">
          {school.name}
        </h3>

        {/* Area */}
        {school.area && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="size-3.5 flex-shrink-0" />
            <span className="truncate">{school.area}</span>
          </div>
        )}

        {/* Google rating */}
        {school.google_rating != null && (
          <div className="flex items-center gap-1 text-sm">
            <Star className="size-3.5 flex-shrink-0 fill-amber-400 text-amber-400" />
            <span className="font-medium text-gray-700">
              {school.google_rating.toFixed(1)}
            </span>
            {school.google_review_count != null && (
              <span className="text-gray-400">
                ({school.google_review_count.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Curriculum badges */}
        {school.curriculum && school.curriculum.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {school.curriculum.map((c) => (
              <Badge
                key={c}
                variant="outline"
                className="text-[10px] px-1.5 py-0 text-gray-600"
              >
                {c}
              </Badge>
            ))}
          </div>
        )}

        {/* SEN badge */}
        {school.has_sen_support && (
          <Badge
            variant="secondary"
            className="w-fit bg-purple-100 text-purple-700 border-0 text-[10px] px-1.5 py-0"
          >
            SEN Support
          </Badge>
        )}

        {/* AI summary */}
        {school.ai_summary && (
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
            {school.ai_summary}
          </p>
        )}
      </div>

      {/* ---- Right: Fees & CTA ---- */}
      <div className="flex flex-shrink-0 flex-col items-end justify-between">
        <div className="text-right">
          {(school.fee_min != null || school.fee_max != null) && (
            <>
              <p className="text-xs text-gray-400">Annual fees</p>
              <p className="text-sm font-semibold text-gray-900">
                {school.fee_min != null && school.fee_max != null ? (
                  <>
                    AED {formatFee(school.fee_min)} &ndash;{" "}
                    {formatFee(school.fee_max)}
                  </>
                ) : school.fee_min != null ? (
                  <>From AED {formatFee(school.fee_min)}</>
                ) : school.fee_max != null ? (
                  <>Up to AED {formatFee(school.fee_max)}</>
                ) : null}
              </p>
            </>
          )}
        </div>

        <Button
          size="sm"
          className="mt-2 bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Navigate to the profile enquiry section
            window.location.href = `/schools/${school.slug}#enquire`;
          }}
        >
          Enquire Now
        </Button>
      </div>
    </Link>
  );
}
