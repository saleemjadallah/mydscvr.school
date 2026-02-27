"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, BookOpen, Heart, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { resolveHeroPhoto } from "@/lib/school-utils";
import SignUpWallModal from "@/components/SignUpWallModal";
import SchoolBadge from "@/components/school-admin/SchoolBadge";
import { getSchoolBadges } from "@/lib/badges";
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
    | "adek_rating"
    | "emirate"
    | "regulator"
    | "fee_min"
    | "fee_max"
    | "google_rating"
    | "google_review_count"
    | "google_photos"
    | "ai_summary"
    | "has_sen_support"
    | "is_featured"
  > & {
    hero_photo_url?: string | null;
    distance_km?: number;
    distance_label?: string;
    subscription_plan?: string | null;
  };
  isSaved?: boolean;
  onToggleSave?: (schoolId: string) => void;
}

export default function SchoolCard({ school, isSaved, onToggleSave }: SchoolCardProps) {
  const { isSignedIn } = useAuth();
  const [wallOpen, setWallOpen] = useState(false);

  const heroPhoto = resolveHeroPhoto(undefined, school.google_photos, school.hero_photo_url);
  const rating = school.khda_rating || school.adek_rating;
  const ratingLabel = school.khda_rating ? "KHDA" : school.adek_rating ? "ADEK" : null;
  const ratingColors = rating
    ? KHDA_COLOR_MAP[rating] ?? { bg: "bg-gray-100", text: "text-gray-700" }
    : null;
  const subscriptionBadges = school.subscription_plan
    ? getSchoolBadges(school.subscription_plan)
    : [];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link
        href={`/schools/${school.slug}`}
        className="group relative flex flex-col sm:flex-row sm:gap-5 rounded-2xl bg-white overflow-hidden sm:overflow-visible sm:p-5 transition-all"
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
        {/* ---- Photo section ---- */}
        {/* Mobile: full-width banner | Desktop: 128px square */}
        <div className="relative flex-shrink-0">
          {heroPhoto ? (
            <div className="relative overflow-hidden sm:rounded-xl">
              <Image
                src={heroPhoto}
                alt={school.name}
                width={400}
                height={200}
                className="h-40 w-full object-cover sm:size-32 sm:rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 sm:rounded-xl bg-gradient-to-t from-black/20 via-transparent to-transparent sm:from-black/10" />
            </div>
          ) : (
            <div
              className="flex h-40 w-full items-center justify-center sm:size-32 sm:rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(168,85,247,0.1))",
              }}
            >
              <BookOpen className="size-10 text-[#FF6B35]/60" />
            </div>
          )}

          {/* Heart icon */}
          <motion.button
            type="button"
            aria-label={isSaved ? "Remove from saved" : "Save school"}
            whileTap={{ scale: 1.3 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isSignedIn) {
                setWallOpen(true);
                return;
              }
              onToggleSave?.(school.id);
            }}
            className={`absolute right-2 top-2 sm:right-1.5 sm:top-1.5 z-10 rounded-full p-2 sm:p-1.5 transition-colors ${
              isSaved
                ? "bg-white/90 text-[#FF6B35]"
                : "bg-white/70 text-gray-400 hover:bg-white/90 hover:text-[#FF6B35]"
            }`}
          >
            <Heart className={`size-5 sm:size-4 ${isSaved ? "fill-[#FF6B35]" : ""}`} />
          </motion.button>

          {/* Mobile-only: rating badge overlay on photo */}
          {rating && ratingColors && (
            <div className="absolute bottom-2 left-2 sm:hidden">
              <Badge
                variant="secondary"
                className={`${ratingColors.bg} ${ratingColors.text} border-0 text-[11px] px-2 py-0.5 shadow-sm backdrop-blur-sm`}
              >
                {ratingLabel}: {rating}
              </Badge>
            </div>
          )}
        </div>

        {/* ---- Details section ---- */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3.5 sm:p-0 sm:gap-2">
          {/* Desktop-only badges row */}
          <div className="hidden sm:flex flex-wrap items-center gap-1.5">
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
            {subscriptionBadges.map((b) => (
              <SchoolBadge key={b.type} type={b.type} size="sm" />
            ))}
            {rating && ratingColors && (
              <Badge
                variant="secondary"
                className={`${ratingColors.bg} ${ratingColors.text} border-0 text-[10px] px-2 py-0.5`}
              >
                {ratingLabel}: {rating}
              </Badge>
            )}
          </div>

          {/* Mobile: Name + Featured badge row */}
          <div className="flex items-start justify-between gap-2 sm:hidden">
            <h3 className="text-[15px] font-bold leading-snug text-gray-900 group-hover:text-[#FF6B35] transition-colors">
              {school.name}
            </h3>
            {school.is_featured && (
              <Badge
                className="flex-shrink-0 border-0 text-[10px] px-2 py-0.5 text-white font-semibold"
                style={{
                  background: "linear-gradient(135deg, #FF6B35, #FBBF24)",
                }}
              >
                Featured
              </Badge>
            )}
          </div>

          {/* Desktop: School name */}
          <h3 className="hidden sm:block truncate text-base font-bold text-gray-900 group-hover:text-[#FF6B35] transition-colors">
            {school.name}
          </h3>

          {/* Mobile: compact info row (area + rating) */}
          <div className="flex items-center gap-3 text-[13px] text-gray-500 sm:hidden">
            {school.area && (
              <span className="flex items-center gap-1 min-w-0">
                <MapPin className="size-3.5 flex-shrink-0 text-gray-400" />
                <span className="truncate">{school.area}</span>
              </span>
            )}
            {school.google_rating != null && (
              <span className="flex items-center gap-1 flex-shrink-0">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-gray-700">
                  {Number(school.google_rating).toFixed(1)}
                </span>
                {school.google_review_count != null && (
                  <span className="text-gray-400">
                    ({Number(school.google_review_count).toLocaleString()})
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Desktop: Area */}
          {school.area && (
            <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="size-3.5 flex-shrink-0" />
              <span className="truncate">{school.area}</span>
            </div>
          )}

          {/* Distance label (both) */}
          {school.distance_label && (
            <div className="flex items-center gap-1 text-[13px] sm:text-sm text-[#FF6B35] font-medium">
              <Navigation className="size-3.5 flex-shrink-0" />
              {school.distance_label}
            </div>
          )}

          {/* Desktop: Google rating */}
          {school.google_rating != null && (
            <div className="hidden sm:flex items-center gap-1 text-sm">
              <Star className="size-3.5 flex-shrink-0 fill-amber-400 text-amber-400" />
              <span className="font-medium text-gray-700">
                {Number(school.google_rating).toFixed(1)}
              </span>
              {school.google_review_count != null && (
                <span className="text-gray-400">
                  ({Number(school.google_review_count).toLocaleString()})
                </span>
              )}
            </div>
          )}

          {/* Mobile: badges row (curriculum + SEN) */}
          {((school.curriculum && school.curriculum.length > 0) || school.has_sen_support) && (
            <div className="flex flex-wrap items-center gap-1.5 sm:hidden">
              {school.curriculum?.map((c) => (
                <Badge
                  key={c}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 text-gray-600"
                >
                  {c}
                </Badge>
              ))}
              {school.has_sen_support && (
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 border-0 text-[10px] px-1.5 py-0"
                >
                  SEN Support
                </Badge>
              )}
            </div>
          )}

          {/* Desktop: Curriculum badges */}
          {school.curriculum && school.curriculum.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1">
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

          {/* Desktop: SEN badge */}
          {school.has_sen_support && (
            <Badge
              variant="secondary"
              className="hidden sm:inline-flex w-fit bg-purple-100 text-purple-700 border-0 text-[10px] px-1.5 py-0"
            >
              SEN Support
            </Badge>
          )}

          {/* AI summary (desktop only — too verbose for mobile cards) */}
          {school.ai_summary && (
            <p className="hidden sm:block line-clamp-2 text-xs leading-relaxed text-gray-500 border-l-2 border-[#FF6B35]/20 pl-2.5">
              {school.ai_summary}
            </p>
          )}

          {/* Mobile: fees + CTA row */}
          <div className="flex items-center justify-between gap-3 mt-1.5 pt-2.5 border-t border-gray-100 sm:hidden">
            <div className="min-w-0">
              {(school.fee_min != null || school.fee_max != null) && (
                <>
                  <p className="text-[10px] text-gray-400 leading-none mb-0.5">Annual fees</p>
                  <p className="text-[13px] font-semibold text-gray-900 truncate">
                    {school.fee_min != null && school.fee_max != null ? (
                      <>
                        AED {formatFee(school.fee_min)} &ndash; {formatFee(school.fee_max)}
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
              className="flex-shrink-0 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
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
        </div>

        {/* ---- Right: Fees & CTA (desktop only) ---- */}
        <div className="hidden sm:flex flex-shrink-0 flex-col items-end justify-between">
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

      <SignUpWallModal open={wallOpen} onClose={() => setWallOpen(false)} feature="save" />
    </motion.div>
  );
}
