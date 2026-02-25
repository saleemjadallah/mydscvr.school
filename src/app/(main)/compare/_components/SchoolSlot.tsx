'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus, X } from 'lucide-react';
import { slotAppear } from '@/lib/animations';
import { SCHOOL_COLORS } from '@/lib/constants';
import { resolveHeroPhoto } from '@/lib/school-utils';
import type { School } from '@/types';

interface SchoolSlotProps {
  school?: School;
  index: number;
  onRemove?: () => void;
  onAdd?: () => void;
}

export default function SchoolSlot({ school, index, onRemove, onAdd }: SchoolSlotProps) {
  const color = SCHOOL_COLORS[index % SCHOOL_COLORS.length];

  if (!school) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="group flex h-[120px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 transition-all hover:border-white/25 hover:bg-white/[0.02]"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors group-hover:border-white/30 group-hover:bg-white/5">
          <Plus className="h-4 w-4 text-white/40 group-hover:text-white/60" />
        </div>
        <span className="text-xs text-white/30 group-hover:text-white/50">
          Add school
        </span>
      </button>
    );
  }

  const photo = resolveHeroPhoto(school.photos, school.google_photos, school.hero_photo_url);

  return (
    <motion.div
      layout
      layoutId={`slot-${school.id}`}
      variants={slotAppear}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative overflow-hidden rounded-xl"
      style={{ borderTop: `3px solid ${color.hex}` }}
    >
      <div className="flex h-[120px] items-start gap-3 bg-white/[0.04] p-3">
        {/* Photo */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
          {photo ? (
            <Image
              src={photo}
              alt={school.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white/20">
              {school.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {school.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-white/50">
            {school.area ?? 'Dubai'}
          </p>
          {school.curriculum?.length > 0 && (
            <p className="mt-1 truncate text-[10px] text-white/35">
              {school.curriculum.join(', ')}
            </p>
          )}
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-400"
          aria-label={`Remove ${school.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
