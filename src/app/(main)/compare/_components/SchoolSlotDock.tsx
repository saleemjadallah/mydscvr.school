'use client';

import { AnimatePresence } from 'framer-motion';
import SchoolSlot from './SchoolSlot';
import { MAX_COMPARE_SCHOOLS } from '@/lib/constants';
import type { School } from '@/types';

interface SchoolSlotDockProps {
  schools: School[];
  onRemove: (id: string) => void;
  onOpenSearch: () => void;
}

export default function SchoolSlotDock({
  schools,
  onRemove,
  onOpenSearch,
}: SchoolSlotDockProps) {
  const emptySlots = MAX_COMPARE_SCHOOLS - schools.length;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {schools.map((school, i) => (
          <SchoolSlot
            key={school.id}
            school={school}
            index={i}
            onRemove={() => onRemove(school.id)}
          />
        ))}
      </AnimatePresence>

      {/* Empty slots */}
      {Array.from({ length: emptySlots }).map((_, j) => (
        <SchoolSlot
          key={`empty-${j}`}
          index={schools.length + j}
          onAdd={onOpenSearch}
        />
      ))}
    </div>
  );
}
