'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const STEPS = [
  { label: 'Gathering school data...', icon: '📊' },
  { label: 'Analyzing differences...', icon: '🔍' },
  { label: 'Generating AI insights...', icon: '✨' },
];

export default function CompareLoadingSkeleton() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-2.5 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-[#FF6B35]" />
          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-sm font-medium text-gray-700"
            >
              {STEPS[step].label}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= step ? 'w-8 bg-[#FF6B35]' : 'w-1.5 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Skeleton cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <div className="h-36 shimmer" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 rounded shimmer" />
              <div className="h-3 w-1/2 rounded shimmer" />
              <div className="flex gap-1">
                <div className="h-5 w-16 rounded-full shimmer" />
                <div className="h-5 w-12 rounded-full shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton radar chart */}
      <div className="flex justify-center">
        <div className="h-[280px] w-[280px] rounded-full shimmer" />
      </div>

      {/* Skeleton table */}
      <div className="space-y-2 rounded-xl border border-gray-100 bg-white p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 w-24 rounded shimmer" />
            <div className="h-4 flex-1 rounded shimmer" />
            <div className="h-4 flex-1 rounded shimmer" />
          </div>
        ))}
      </div>

      {/* Skeleton AI card */}
      <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg shimmer" />
          <div className="h-4 w-32 rounded shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded shimmer" />
          <div className="h-3 w-5/6 rounded shimmer" />
          <div className="h-3 w-4/6 rounded shimmer" />
          <div className="h-3 w-full rounded shimmer" />
          <div className="h-3 w-3/4 rounded shimmer" />
        </div>
      </div>
    </div>
  );
}
