'use client';

import { motion } from 'framer-motion';
import { Scale, ArrowRight } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface CompareEmptyStateProps {
  onSuggestion?: (slugs: string[]) => void;
}

const SUGGESTIONS = [
  {
    label: 'Top British schools',
    slugs: ['gems-wellington-international-school', 'dubai-british-school'],
  },
  {
    label: 'IB vs British',
    slugs: ['gems-world-academy', 'gems-wellington-international-school'],
  },
  {
    label: 'Budget-friendly',
    slugs: ['the-winchester-school', 'delhi-private-school'],
  },
];

export default function CompareEmptyState({ onSuggestion }: CompareEmptyStateProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white px-8 py-16 text-center shadow-sm"
    >
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-[#FF6B35]/5 blur-[60px]" />
        <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-purple-500/5 blur-[60px]" />
      </div>

      <motion.div variants={staggerItem} className="relative">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B35]/10 to-purple-500/10">
          <Scale className="h-8 w-8 text-[#FF6B35]" />
        </div>
      </motion.div>

      <motion.h2
        variants={staggerItem}
        className="mt-5 text-lg font-bold text-gray-900"
      >
        Ready to compare?
      </motion.h2>

      <motion.p
        variants={staggerItem}
        className="mx-auto mt-2 max-w-md text-sm text-gray-500"
      >
        Search and select 2 to 4 schools above, then click Compare to see a
        detailed side-by-side comparison powered by AI.
      </motion.p>

      {/* Suggestion chips */}
      {onSuggestion && (
        <motion.div
          variants={staggerItem}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs text-gray-400">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => onSuggestion(s.slugs)}
              className="group flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:border-[#FF6B35]/30 hover:text-[#FF6B35]"
            >
              {s.label}
              <ArrowRight className="h-3 w-3 text-gray-300 transition-colors group-hover:text-[#FF6B35]" />
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
