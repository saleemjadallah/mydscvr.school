"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getFeaturedSchools } from "@/lib/api";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import FeaturedSchoolCard from "./FeaturedSchoolCard";

export default function FeaturedSchools() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["featured-schools"],
    queryFn: getFeaturedSchools,
    staleTime: 10 * 60 * 1000, // 10 min
  });

  const schools = data?.schools;

  // Hide entirely if no featured schools and not loading
  if (!isLoading && (!schools || schools.length === 0)) return null;

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{ background: "var(--gradient-section-dark)" }}
    >
      {/* Decorative blur orbs */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[400px] w-[400px] rounded-full bg-[#FF6B35]/6 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[350px] w-[350px] rounded-full bg-[#A855F7]/5 blur-[120px]" />

      {/* Optional backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/backdrops/testimonials-backdrop.webp"
          alt=""
          fill
          className="object-cover opacity-40 mix-blend-lighten"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        {/* Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeInUp}
          className="mb-10 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Discover our{" "}
            <span className="text-gradient-brand">Featured Schools</span>
          </h2>
          <p className="mt-3 text-base text-gray-400">
            Hand-picked schools with outstanding track records and parent satisfaction
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="group/carousel relative">
          {/* Scroll arrows — visible on hover (desktop) */}
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:group-hover/carousel:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:group-hover/carousel:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-5" />
          </button>

          <motion.div
            ref={scrollRef}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory"
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[280px] snap-start"
                  >
                    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5">
                      <div className="aspect-[16/10] rounded-t-2xl bg-white/10" />
                      <div className="space-y-3 p-4">
                        <div className="h-4 w-3/4 rounded bg-white/10" />
                        <div className="h-3 w-1/2 rounded bg-white/10" />
                        <div className="h-3 w-1/3 rounded bg-white/10" />
                      </div>
                    </div>
                  </div>
                ))
              : schools!.map((school) => (
                  <FeaturedSchoolCard key={school.slug} school={school} />
                ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-10 text-center"
        >
          <Link
            href="/schools"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #FF6B35, #F59E0B)",
            }}
          >
            View All Schools
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
