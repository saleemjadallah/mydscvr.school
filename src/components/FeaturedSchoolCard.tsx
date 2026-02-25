"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { resolveHeroPhoto, feeLabel } from "@/lib/school-utils";
import { staggerItem } from "@/lib/animations";
import type { School } from "@/types";

const KHDA_COLORS: Record<string, { bg: string; text: string }> = {
  Outstanding: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  "Very Good": { bg: "bg-blue-500/20", text: "text-blue-400" },
  Good: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  Acceptable: { bg: "bg-orange-500/20", text: "text-orange-400" },
  Weak: { bg: "bg-red-500/20", text: "text-red-400" },
};

type FeaturedSchoolCardProps = Pick<
  School,
  | "slug"
  | "name"
  | "area"
  | "khda_rating"
  | "google_rating"
  | "fee_min"
  | "fee_max"
  | "curriculum"
  | "google_photos"
> & {
  hero_photo_url?: string | null;
};

export default function FeaturedSchoolCard({
  school,
}: {
  school: FeaturedSchoolCardProps;
}) {
  const heroPhoto = resolveHeroPhoto(
    undefined,
    school.google_photos,
    school.hero_photo_url
  );
  const khdaColors = school.khda_rating
    ? KHDA_COLORS[school.khda_rating] ?? { bg: "bg-gray-500/20", text: "text-gray-400" }
    : null;

  return (
    <motion.div variants={staggerItem} className="flex-shrink-0 w-[280px] snap-start">
      <Link
        href={`/schools/${school.slug}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-[#FF6B35]/30 hover:bg-white/8"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}
      >
        {/* Photo */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {heroPhoto ? (
            <Image
              src={heroPhoto}
              alt={school.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="280px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF6B35]/20 to-[#A855F7]/20">
              <span className="text-3xl">🏫</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* KHDA badge */}
          {khdaColors && school.khda_rating && (
            <span
              className={`absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${khdaColors.bg} ${khdaColors.text} backdrop-blur-sm`}
            >
              {school.khda_rating}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-[#FF6B35] transition-colors">
            {school.name}
          </h3>

          {school.area && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="size-3 flex-shrink-0" />
              <span className="truncate">{school.area}</span>
            </div>
          )}

          {/* Curriculum tags */}
          {school.curriculum && school.curriculum.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {school.curriculum.slice(0, 2).map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-gray-300"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Fee range */}
          <p className="mt-auto pt-1 text-xs font-medium text-[#FF6B35]">
            {feeLabel(school.fee_min, school.fee_max)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
