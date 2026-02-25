'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SCHOOL_COLORS, KHDA_COLOR_MAP } from '@/lib/constants';
import { resolveHeroPhoto, feeLabel } from '@/lib/school-utils';
import { staggerItem } from '@/lib/animations';
import type { CompareSchool } from '@/types';

interface SchoolHeaderCardsProps {
  schools: CompareSchool[];
}

export default function SchoolHeaderCards({ schools }: SchoolHeaderCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {schools.map((school, i) => {
        const color = SCHOOL_COLORS[i % SCHOOL_COLORS.length];
        const photo = resolveHeroPhoto(school.photos, school.google_photos, school.hero_photo_url);
        const khdaColors = school.khda_rating
          ? KHDA_COLOR_MAP[school.khda_rating]
          : null;

        return (
          <motion.div
            key={school.id}
            variants={staggerItem}
            className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            style={{ borderTopWidth: '3px', borderTopColor: color.hex }}
          >
            {/* Photo */}
            <div className="relative h-36 w-full overflow-hidden bg-gray-100">
              {photo ? (
                <Image
                  src={photo}
                  alt={school.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${color.hex}15, ${color.hex}05)` }}
                >
                  <span className="text-3xl font-bold" style={{ color: `${color.hex}30` }}>
                    {school.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* KHDA badge overlay */}
              {khdaColors && school.khda_rating && (
                <div className="absolute left-2 top-2">
                  <Badge className={`${khdaColors.bg} ${khdaColors.text} border-0 text-[10px] font-semibold shadow-sm`}>
                    {school.khda_rating}
                  </Badge>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <Link
                href={`/schools/${school.slug}`}
                className="block truncate text-sm font-bold text-gray-900 hover:text-[#FF6B35]"
              >
                {school.name}
                <ExternalLink className="ml-1 inline-block h-3 w-3 text-gray-300" />
              </Link>

              <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{school.area ?? 'Dubai'}</span>
              </div>

              {/* Curriculum badges */}
              {school.curriculum?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {school.curriculum.slice(0, 2).map((c) => (
                    <Badge key={c} variant="outline" className="text-[9px] px-1.5 py-0 text-gray-500">
                      {c}
                    </Badge>
                  ))}
                  {school.curriculum.length > 2 && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-gray-400">
                      +{school.curriculum.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* Bottom row: rating + fee */}
              <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2">
                {school.google_rating != null ? (
                  <span className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-gray-700">
                      {Number(school.google_rating).toFixed(1)}
                    </span>
                  </span>
                ) : (
                  <span />
                )}
                <span className="text-[11px] font-medium text-gray-500">
                  {feeLabel(school.fee_min, school.fee_max)}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
