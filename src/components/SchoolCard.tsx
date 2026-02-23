"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, BookOpen, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { School } from "@/types";

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
  isSaved?: boolean;
  onToggleSave?: (schoolId: string) => void;
}

export default function SchoolCard({ school, isSaved, onToggleSave }: SchoolCardProps) {
  const photos = resolvePhotos(school.google_photos as string[] | string | null);
  const heroPhoto = photos[0] ?? null;
  const khdaColors = school.khda_rating
    ? KHDA_COLOR_MAP[school.khda_rating] ?? { bg: "bg-gray-100", text: "text-gray-700" }
    : null;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link
        href={`/schools/${school.slug}`}
        className="group relative flex gap-5 rounded-2xl bg-white p-5 transition-all"
        style={{
          boxShadow: "var(--shadow-card)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-card)";
        }}
      >
        {/* ---- Left: Photo with heart overlay ---- */}
        <div className="relative flex-shrink-0">
          {heroPhoto ? (
            <div className="relative overflow-hidden rounded-xl">
              <Image
                src={heroPhoto}
                alt={school.name}
                width={128}
                height={128}
                className="size-32 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent" />
            </div>
          ) : (
            <div
              className="flex size-32 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(168,85,247,0.1))",
              }}
            >
              <BookOpen className="size-10 text-[#FF6B35]/60" />
            </div>
          )}
          {/* Heart icon on photo */}
          <motion.button
            type="button"
            aria-label={isSaved ? "Remove from saved" : "Save school"}
            whileTap={{ scale: 1.3 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave?.(school.id);
            }}
            className={`absolute right-1.5 top-1.5 z-10 rounded-full p-1.5 transition-colors ${
              isSaved
                ? "bg-white/90 text-[#FF6B35]"
                : "bg-white/70 text-gray-400 hover:bg-white/90 hover:text-[#FF6B35]"
            }`}
          >
            <Heart className={`size-4 ${isSaved ? "fill-[#FF6B35]" : ""}`} />
          </motion.button>
        </div>

        {/* ---- Center: Details ---- */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {school.is_featured && (
              <Badge
                className="border-0 text-[10px] px-2 py-0.5 text-white font-semibold"
                style={{
                  background: "linear-gradient(135deg, #FF6B35, #FBBF24)",
                }}
              >
                Featured
              </Badge>
            )}
            {school.khda_rating && khdaColors && (
              <Badge
                variant="secondary"
                className={`${khdaColors.bg} ${khdaColors.text} border-0 text-[10px] px-2 py-0.5`}
              >
                KHDA: {school.khda_rating}
              </Badge>
            )}
          </div>

          {/* School name */}
          <h3 className="truncate text-base font-bold text-gray-900 group-hover:text-[#FF6B35] transition-colors">
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
            <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 border-l-2 border-[#FF6B35]/20 pl-2.5">
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

          <button
            type="button"
            className="mt-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #FF6B35, #F59E0B)",
              boxShadow: "0 2px 8px rgba(255, 107, 53, 0.25)",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/schools/${school.slug}#enquire`;
            }}
          >
            Enquire Now
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
