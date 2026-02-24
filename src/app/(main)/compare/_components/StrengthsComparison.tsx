'use client';

import { motion } from 'framer-motion';
import { ThumbsUp, AlertCircle } from 'lucide-react';
import { SCHOOL_COLORS } from '@/lib/constants';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { CompareSchool } from '@/types';

interface StrengthsComparisonProps {
  schools: CompareSchool[];
}

export default function StrengthsComparison({ schools }: StrengthsComparisonProps) {
  const hasData = schools.some(
    (s) =>
      (s.ai_strengths && s.ai_strengths.length > 0) ||
      (s.ai_considerations && s.ai_considerations.length > 0)
  );

  if (!hasData) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {schools.map((school, i) => {
        const color = SCHOOL_COLORS[i % SCHOOL_COLORS.length];
        const strengths = school.ai_strengths ?? [];
        const considerations = school.ai_considerations ?? [];

        return (
          <motion.div
            key={school.id}
            variants={staggerItem}
            className="rounded-xl border border-gray-100 bg-white p-4"
            style={{ borderTopWidth: '3px', borderTopColor: color.hex }}
          >
            <h4 className="text-sm font-bold text-gray-900 truncate">
              {school.name}
            </h4>

            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Strengths
                </div>
                <ul className="mt-1.5 space-y-1">
                  {strengths.slice(0, 4).map((s, si) => (
                    <li
                      key={si}
                      className="flex items-start gap-1.5 text-xs text-gray-600"
                    >
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Considerations */}
            {considerations.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Consider
                </div>
                <ul className="mt-1.5 space-y-1">
                  {considerations.slice(0, 3).map((c, ci) => (
                    <li
                      key={ci}
                      className="flex items-start gap-1.5 text-xs text-gray-600"
                    >
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
