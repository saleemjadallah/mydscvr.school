'use client';

import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function CompareHero() {
  return (
    <section
      className="compare-hero relative overflow-hidden py-20 md:py-28"
      style={{ background: 'var(--gradient-hero)' }}
    >
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -left-32 top-1/4 h-[400px] w-[400px] rounded-full bg-[#FF6B35]/12 blur-[100px]"
        animate={{ x: [0, 25, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-24 top-1/3 h-[350px] w-[350px] rounded-full bg-purple-500/10 blur-[100px]"
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-amber-500/8 blur-[80px]"
        animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative mx-auto max-w-3xl px-4 text-center"
      >
        <motion.div variants={staggerItem} className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl glass-dark">
          <Scale className="h-8 w-8 text-[#FF6B35]" />
        </motion.div>

        <motion.h1
          variants={staggerItem}
          className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
        >
          Compare{' '}
          <span className="text-gradient-brand">Schools</span>
        </motion.h1>

        <motion.p
          variants={staggerItem}
          className="mx-auto mt-4 max-w-xl text-base text-white/60 md:text-lg"
        >
          Add up to 4 schools side by side. Our AI generates a detailed
          comparison to help you make the right choice.
        </motion.p>
      </motion.div>
    </section>
  );
}
