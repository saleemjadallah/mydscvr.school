'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, MapPin, GraduationCap, CheckCircle, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const EXAMPLE_QUERIES = [
  'Outstanding British school near JBR under AED 80k/year',
  'Nursery in Downtown with strong Arabic language program',
  'IB school with excellent SEN support, any area',
  'Affordable Indian curriculum school, Mirdif area',
];

const STATS = [
  { label: 'Private Schools', value: '200+', icon: GraduationCap },
  { label: 'Nurseries', value: '500+', icon: MapPin },
  { label: 'KHDA Verified Ratings', value: '', icon: CheckCircle },
  { label: 'AI Smart Matching', value: '', icon: Brain },
];

const CURRICULA = [
  { name: 'British', flag: '\u{1F1EC}\u{1F1E7}', count: 85 },
  { name: 'American', flag: '\u{1F1FA}\u{1F1F8}', count: 42 },
  { name: 'IB', flag: '\u{1F30D}', count: 38 },
  { name: 'Indian', flag: '\u{1F1EE}\u{1F1F3}', count: 55 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSearch(searchQuery?: string) {
    const q = (searchQuery ?? query).trim();
    if (!q) return;
    router.push(`/schools?q=${encodeURIComponent(q)}`);
  }

  function handleCurriculumClick(curriculum: string) {
    router.push(`/schools?curriculum=${encodeURIComponent(curriculum)}`);
  }

  return (
    <div className="min-h-screen">
      {/* ================================================================== */}
      {/* HERO SECTION                                                       */}
      {/* ================================================================== */}
      <section
        className="relative overflow-hidden pb-16 pt-20 sm:pb-24 sm:pt-28"
        style={{
          background: 'linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#FF6B35]/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-[#FF6B35]/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          {/* Sparkle badge */}
          <Badge className="mb-6 gap-1.5 border-[#FF6B35]/20 bg-[#FF6B35]/10 px-3 py-1 text-sm font-medium text-[#FF6B35]">
            <Sparkles className="size-4" />
            AI-powered school discovery for Dubai
          </Badge>

          {/* Heading */}
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Find the perfect school
            <br />
            <span className="text-[#FF6B35]">for your child in Dubai</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
            Search 200+ schools and 500+ nurseries using AI. Powered by KHDA
            inspection data, parent reviews, and live fee information.
          </p>

          {/* ---------------------------------------------------------------- */}
          {/* Search bar                                                       */}
          {/* ---------------------------------------------------------------- */}
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-[#FF6B35]/5 transition-shadow focus-within:shadow-xl focus-within:shadow-[#FF6B35]/10">
              <Search className="ml-3 size-5 flex-shrink-0 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Describe the ideal school for your child..."
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              <Button
                onClick={() => handleSearch()}
                className="h-12 rounded-xl bg-[#FF6B35] px-6 text-base font-semibold text-white hover:bg-[#e55a2a]"
              >
                <Search className="mr-1.5 size-4" />
                Search
              </Button>
            </div>

            {/* Example query chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-gray-400">Try:</span>
              {EXAMPLE_QUERIES.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => {
                    setQuery(eq);
                    handleSearch(eq);
                  }}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-[#FF6B35]/40 hover:bg-[#FF6B35]/5 hover:text-[#FF6B35]"
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* STATS BAR                                                          */}
      {/* ================================================================== */}
      <section className="border-b border-t border-gray-100 bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#FF6B35]/10">
                <stat.icon className="size-5 text-[#FF6B35]" />
              </div>
              {stat.value && (
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
              )}
              <span className="text-sm font-medium text-gray-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* BROWSE BY CURRICULUM                                               */}
      {/* ================================================================== */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Browse by Curriculum
            </h2>
            <p className="mt-2 text-base text-gray-500">
              Explore schools based on your preferred educational framework
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CURRICULA.map((curr) => (
              <button
                key={curr.name}
                type="button"
                onClick={() => handleCurriculumClick(curr.name)}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#FF6B35]/40 hover:shadow-md hover:shadow-[#FF6B35]/5"
              >
                <span className="text-4xl">{curr.flag}</span>
                <span className="text-lg font-semibold text-gray-900 group-hover:text-[#FF6B35]">
                  {curr.name}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-0.5 text-sm text-gray-500 group-hover:bg-[#FF6B35]/10 group-hover:text-[#FF6B35]">
                  {curr.count} schools
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
