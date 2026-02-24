'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOADING_STEPS = [
  'Gathering data...',
  'Analyzing differences...',
  'Generating insights...',
];

interface CompareButtonProps {
  count: number;
  loading: boolean;
  onClick: () => void;
}

export default function CompareButton({ count, loading, onClick }: CompareButtonProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading) {
      setStep(0);
      return;
    }
    const interval = setInterval(() => {
      setStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <Button
      disabled={count < 2 || loading}
      onClick={onClick}
      className="relative h-11 min-w-[180px] overflow-hidden rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] px-6 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-[var(--shadow-brand-md)] disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key={`step-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            {LOADING_STEPS[step]}
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Compare {count} School{count !== 1 ? 's' : ''}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
