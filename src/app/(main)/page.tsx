'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { Search, Sparkles, MapPin, GraduationCap, CheckCircle, Brain, Quote } from 'lucide-react';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';
import AnimatedCounter from '@/components/AnimatedCounter';
import FeaturedSchools from '@/components/FeaturedSchools';
import HomepageNews from '@/components/HomepageNews';
import SignUpWallModal from '@/components/SignUpWallModal';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type CityKey = '' | 'dubai' | 'abu_dhabi';

const CITY_CONFIG: Record<CityKey, {
  badge: string;
  headingSuffix: string;
  regulator: string;
  searchPlaceholder: string;
  queries: string[];
}> = {
  '': {
    badge: 'AI-powered school discovery for the UAE',
    headingSuffix: '',
    regulator: 'KHDA & ADEK',
    searchPlaceholder: 'Describe the ideal school for your child...',
    queries: [
      'Outstanding British school near JBR under AED 80k/year',
      'Best IB schools in Abu Dhabi with strong arts program',
      'IB school with excellent SEN support, any area',
      'Best schools near me',
    ],
  },
  dubai: {
    badge: 'AI-powered school discovery for Dubai',
    headingSuffix: ' in Dubai',
    regulator: 'KHDA',
    searchPlaceholder: 'Describe the ideal school in Dubai...',
    queries: [
      'Outstanding British school near JBR under AED 80k/year',
      'Nursery in Downtown with strong Arabic language program',
      'IB school with excellent SEN support, any area',
      'Best schools near me',
    ],
  },
  abu_dhabi: {
    badge: 'AI-powered school discovery for Abu Dhabi',
    headingSuffix: ' in Abu Dhabi',
    regulator: 'ADEK',
    searchPlaceholder: 'Describe the ideal school in Abu Dhabi...',
    queries: [
      'Best IB schools in Abu Dhabi with strong arts program',
      'British school near Khalifa City under AED 60k/year',
      'Nursery in Al Ain with SEN support',
      'Outstanding schools on Saadiyat Island',
    ],
  },
};

// Fallback values shown immediately, replaced once API responds
const DEFAULT_STATS = { schools: 200, nurseries: 500 };

const CURRICULUM_FLAGS: Record<string, string> = {
  British: '\u{1F1EC}\u{1F1E7}',
  American: '\u{1F1FA}\u{1F1F8}',
  IB: '\u{1F30D}',
  Indian: '\u{1F1EE}\u{1F1F3}',
  French: '\u{1F1EB}\u{1F1F7}',
  Canadian: '\u{1F1E8}\u{1F1E6}',
  German: '\u{1F1E9}\u{1F1EA}',
  Japanese: '\u{1F1EF}\u{1F1F5}',
  MOE: '\u{1F1E6}\u{1F1EA}',
};

const DEFAULT_CURRICULA = [
  { name: 'British', count: 85 },
  { name: 'American', count: 42 },
  { name: 'IB', count: 38 },
  { name: 'Indian', count: 55 },
];

const TESTIMONIALS = [
  {
    quote: "mydscvr.ai helped us find the perfect British school in Marina within minutes. The AI understood exactly what we needed.",
    author: "Sarah M.",
    role: "Parent of two",
  },
  {
    quote: "The comparison tool saved us weeks of research. We could see fees, ratings, and reviews side by side.",
    author: "Ahmed K.",
    role: "Father, relocated from UK",
  },
  {
    quote: "Moving to Abu Dhabi, we had no idea where to start. mydscvr.ai showed us ADEK-rated schools near Khalifa City instantly.",
    author: "Fatima R.",
    role: "Mother, relocated to Abu Dhabi",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [wallOpen, setWallOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<CityKey>('');
  const [liveStats, setLiveStats] = useState(DEFAULT_STATS);
  const [liveCurricula, setLiveCurricula] = useState(DEFAULT_CURRICULA);

  const cfg = CITY_CONFIG[city];

  // Fetch real stats from API — refetch when city changes
  useEffect(() => {
    const params = city ? `?emirate=${city}` : '';
    fetch(`/api/stats${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.schools != null) setLiveStats({ schools: data.schools, nurseries: data.nurseries });
        if (data.curricula?.length) {
          setLiveCurricula(data.curricula.slice(0, 4));
        }
      })
      .catch(() => {}); // Keep defaults on failure
  }, [city]);

  function handleSearch(searchQuery?: string) {
    const q = (searchQuery ?? query).trim();
    if (!q) return;

    if (!isSignedIn) {
      setWallOpen(true);
      return;
    }

    const emirateParam = city ? `&emirate=${city}` : '';
    router.push(`/schools?q=${encodeURIComponent(q)}${emirateParam}`);
  }

  function handleCurriculumClick(curriculum: string) {
    const emirateParam = city ? `&emirate=${city}` : '';
    router.push(`/schools?curriculum=${encodeURIComponent(curriculum)}${emirateParam}`);
  }

  return (
    <div className="min-h-screen">
      {/* ================================================================== */}
      {/* DARK CINEMATIC HERO                                                */}
      {/* ================================================================== */}
      <section
        className="relative min-h-[85vh] flex items-center overflow-hidden"
        style={{ background: 'var(--gradient-hero)' }}
      >
        {/* AI-generated backdrop image */}
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/backdrops/hero-backdrop.webp"
            alt=""
            fill
            className="object-cover opacity-60 mix-blend-screen"
            priority
          />
        </div>

        {/* Animated gradient orbs (layered on top of backdrop) */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-[#FF6B35]/10 blur-[120px]"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full bg-[#A855F7]/8 blur-[120px]"
            animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Dot grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-4xl px-4 py-24 text-center"
        >
          {/* Sparkle badge */}
          <motion.div variants={staggerItem}>
            <span className="inline-flex items-center gap-1.5 rounded-full glass-dark px-4 py-2 text-sm font-medium text-white/90">
              <Sparkles className="size-4 text-[#FBBF24]" />
              {cfg.badge}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={staggerItem}
            className="mx-auto mt-8 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Find the perfect school
            <br />
            <span className="text-gradient-brand">for your child{cfg.headingSuffix}</span>
          </motion.h1>

          {/* City toggle */}
          <motion.div variants={staggerItem} className="mt-6 flex items-center justify-center gap-1.5">
            {([['', 'All UAE'], ['dubai', 'Dubai'], ['abu_dhabi', 'Abu Dhabi']] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCity(key as CityKey)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  city === key
                    ? 'bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/25'
                    : 'glass-dark text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={staggerItem}
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl"
          >
            Search {liveStats.schools}+ schools and {liveStats.nurseries}+ nurseries using AI. Powered by {cfg.regulator}{' '}
            inspection data, parent reviews, and live fee information.
          </motion.p>

          {/* Search bar */}
          <motion.div variants={staggerItem} className="mx-auto mt-10 max-w-2xl">
            <div className="flex items-center gap-2 rounded-2xl glass-dark p-2 shadow-2xl transition-all focus-within:ring-1 focus-within:ring-white/20">
              <Search className="ml-3 size-5 flex-shrink-0 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={cfg.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-white placeholder:text-gray-500 focus:outline-none"
              />
              <button
                onClick={() => handleSearch()}
                className="flex h-12 items-center gap-1.5 rounded-xl px-6 text-base font-semibold text-white transition-all hover:opacity-90 btn-glow"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35, #F59E0B)',
                }}
              >
                <Search className="size-4" />
                Search
              </button>
            </div>

            {/* Example query chips */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-gray-500">Try:</span>
              {cfg.queries.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => {
                    setQuery(eq);
                    handleSearch(eq);
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-gray-300 transition-all hover:border-[#FF6B35]/40 hover:bg-white/10 hover:text-white"
                >
                  {eq}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ================================================================== */}
      {/* TRANSITION CLOUDS (hero → light section)                           */}
      {/* ================================================================== */}
      <div className="relative -mt-1 h-[180px] sm:h-[240px] overflow-hidden">
        <Image
          src="/backdrops/transition-clouds.webp"
          alt=""
          fill
          className="object-cover object-top opacity-70"
        />
        {/* Gradient fade from hero dark to white */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628] via-transparent to-white" />
      </div>

      {/* ================================================================== */}
      {/* FLOATING STATS BAR                                                 */}
      {/* ================================================================== */}
      <section className="relative z-10 -mt-32 px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mx-auto grid max-w-5xl grid-cols-2 gap-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] sm:grid-cols-4 sm:p-8"
        >
          {[
            { label: 'Private Schools', value: liveStats.schools, suffix: '+', icon: GraduationCap, accent: 'rgba(255,107,53,0.12)', accentBorder: 'rgba(255,107,53,0.2)' },
            { label: 'Nurseries', value: liveStats.nurseries, suffix: '+', icon: MapPin, accent: 'rgba(168,85,247,0.12)', accentBorder: 'rgba(168,85,247,0.2)' },
            { label: 'Verified Ratings', value: 100, suffix: '%', icon: CheckCircle, accent: 'rgba(16,185,129,0.12)', accentBorder: 'rgba(16,185,129,0.2)' },
            { label: 'AI Smart Matching', value: 24, suffix: '/7', icon: Brain, accent: 'rgba(251,191,36,0.12)', accentBorder: 'rgba(251,191,36,0.2)' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="flex flex-col items-center gap-2.5 text-center"
            >
              <div
                className="relative flex size-14 items-center justify-center rounded-2xl backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${stat.accent}, rgba(255,255,255,0.6))`,
                  border: `1px solid ${stat.accentBorder}`,
                  boxShadow: `0 4px 12px ${stat.accent}, inset 0 1px 1px rgba(255,255,255,0.5)`,
                }}
              >
                <stat.icon className="size-6 text-[#FF6B35]" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-sm font-medium text-gray-500">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ================================================================== */}
      {/* BROWSE BY CURRICULUM                                               */}
      {/* ================================================================== */}
      <section
        className="relative py-20 sm:py-24 overflow-hidden"
        style={{ background: 'var(--gradient-section-light)' }}
      >
        {/* Subtle watercolor accent backdrop */}
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/backdrops/light-section-accent.webp"
            alt=""
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="relative mx-auto max-w-5xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInUp}
            className="mb-10 text-center"
          >
            <h2 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              Browse by{' '}
              <span className="text-gradient-brand">Curriculum</span>
            </h2>
            <p className="mt-3 text-base text-gray-500">
              Explore schools based on your preferred educational framework
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {liveCurricula.map((curr) => (
              <motion.button
                key={curr.name}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                type="button"
                onClick={() => handleCurriculumClick(curr.name)}
                className="group relative flex flex-col items-center gap-3 rounded-2xl border border-gray-200/60 bg-white p-6 transition-all hover:border-transparent hover:shadow-lg"
              >
                {/* Gradient border on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100 border-gradient" />

                <span className="text-4xl">{CURRICULUM_FLAGS[curr.name] ?? '\u{1F393}'}</span>
                <span className="text-lg font-semibold text-gray-900 group-hover:text-[#FF6B35]">
                  {curr.name}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-0.5 text-sm text-gray-500 transition-colors group-hover:bg-[#FF6B35] group-hover:text-white">
                  {curr.count} schools
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FEATURED SCHOOLS (DARK)                                            */}
      {/* ================================================================== */}
      <FeaturedSchools />

      {/* ================================================================== */}
      {/* NEWS & INSIGHTS (LIGHT)                                            */}
      {/* ================================================================== */}
      <HomepageNews />

      {/* ================================================================== */}
      {/* SOCIAL PROOF / TRUST SECTION                                       */}
      {/* ================================================================== */}
      <section
        className="relative overflow-hidden py-20 sm:py-24"
        style={{ background: 'var(--gradient-section-dark)' }}
      >
        {/* AI-generated atmospheric backdrop */}
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/backdrops/testimonials-backdrop.webp"
            alt=""
            fill
            className="object-cover opacity-70 mix-blend-lighten"
          />
        </div>

        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-[#FF6B35]/5 blur-[100px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-[#A855F7]/5 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInUp}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Trusted by thousands of{' '}
              <span className="text-gradient-brand">UAE families</span>
            </h2>
            <p className="mt-3 text-base text-gray-400">
              See what parents are saying about their school discovery journey
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid gap-6 sm:grid-cols-3"
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.author}
                variants={staggerItem}
                className="rounded-2xl glass-dark p-6"
              >
                <Quote className="mb-3 size-5 text-[#FF6B35]/60" />
                <p className="mb-4 text-sm leading-relaxed text-gray-300">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-white">{t.author}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SignUpWallModal open={wallOpen} onClose={() => setWallOpen(false)} feature="ai-search" />
    </div>
  );
}
