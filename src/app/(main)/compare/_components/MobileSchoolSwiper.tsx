'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SCHOOL_COLORS, KHDA_COLOR_MAP } from '@/lib/constants';
import { resolvePhoto, feeLabel } from '@/lib/school-utils';
import type { CompareSchool } from '@/types';

interface MobileSchoolSwiperProps {
  schools: CompareSchool[];
}

export default function MobileSchoolSwiper({ schools }: MobileSchoolSwiperProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  function prev() {
    setActiveIndex((i) => (i > 0 ? i - 1 : schools.length - 1));
  }

  function next() {
    setActiveIndex((i) => (i < schools.length - 1 ? i + 1 : 0));
  }

  const school = schools[activeIndex];
  const color = SCHOOL_COLORS[activeIndex % SCHOOL_COLORS.length];
  const photo = resolvePhoto(school.google_photos);
  const khdaColors = school.khda_rating
    ? KHDA_COLOR_MAP[school.khda_rating]
    : null;

  return (
    <div className="md:hidden">
      <div className="relative">
        {/* Navigation arrows */}
        <button
          type="button"
          onClick={prev}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={school.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            style={{ borderTopWidth: '3px', borderTopColor: color.hex }}
          >
            {/* Photo */}
            <div className="relative h-44 w-full overflow-hidden bg-gray-100">
              {photo ? (
                <Image
                  src={photo}
                  alt={school.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${color.hex}15, ${color.hex}05)` }}
                >
                  <span className="text-4xl font-bold" style={{ color: `${color.hex}30` }}>
                    {school.name.charAt(0)}
                  </span>
                </div>
              )}

              {khdaColors && school.khda_rating && (
                <div className="absolute left-3 top-3">
                  <Badge className={`${khdaColors.bg} ${khdaColors.text} border-0 text-xs font-semibold shadow-sm`}>
                    {school.khda_rating}
                  </Badge>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <Link
                href={`/schools/${school.slug}`}
                className="text-base font-bold text-gray-900 hover:text-[#FF6B35]"
              >
                {school.name}
                <ExternalLink className="ml-1.5 inline-block h-3.5 w-3.5 text-gray-300" />
              </Link>

              <div className="mt-1.5 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {school.area ?? 'Dubai'}
              </div>

              {/* Curriculum + rating row */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {school.curriculum?.slice(0, 2).map((c) => (
                    <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0 text-gray-500">
                      {c}
                    </Badge>
                  ))}
                </div>

                {school.google_rating != null && (
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-gray-700">
                      {Number(school.google_rating).toFixed(1)}
                    </span>
                  </span>
                )}
              </div>

              {/* Fee */}
              <div className="mt-3 border-t border-gray-50 pt-2">
                <span className="text-sm font-semibold text-gray-900">
                  {feeLabel(school.fee_min, school.fee_max)}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {schools.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex
                ? 'w-6 bg-[#FF6B35]'
                : 'w-1.5 bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label={`Go to school ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
