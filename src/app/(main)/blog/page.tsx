"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import {
  getAllPosts,
  getFeaturedPosts,
  CATEGORY_COLORS,
  type BlogCategory,
} from "@/content/blog";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/animations";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ALL_CATEGORIES: BlogCategory[] = [
  "School Guide",
  "Curriculum Guide",
  "Admissions",
  "Education Tips",
  "Dubai Living",
  "Nursery Guide",
  "News",
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CategoryPill({
  category,
  active,
  onClick,
}: {
  category: BlogCategory | "All";
  active: boolean;
  onClick: () => void;
}) {
  const colors =
    category !== "All" ? CATEGORY_COLORS[category] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-300 ${
        active
          ? "text-white shadow-lg"
          : "text-gray-300 hover:text-white hover:bg-white/[0.08]"
      }`}
    >
      {active && (
        <motion.div
          layoutId="category-pill"
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%)",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      {colors && !active && (
        <span className={`relative z-10 size-1.5 rounded-full ${colors.dot}`} />
      )}
      <span className="relative z-10">{category}</span>
    </button>
  );
}

function FeaturedCard({ post }: { post: ReturnType<typeof getAllPosts>[0] }) {
  const colors = CATEGORY_COLORS[post.category];

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <motion.article
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="relative overflow-hidden rounded-2xl bg-white"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="grid lg:grid-cols-[1.2fr_1fr]">
          {/* Image side */}
          <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:min-h-[420px]">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
            {/* Gradient overlay for text readability on mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />

            {/* Mobile title overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 lg:hidden">
              <span
                className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${colors.bg} ${colors.text}`}
              >
                <span className={`size-1.5 rounded-full ${colors.dot}`} />
                {post.category}
              </span>
              <h2 className="font-display text-2xl font-bold leading-tight text-white">
                {post.title}
              </h2>
            </div>
          </div>

          {/* Content side */}
          <div className="flex flex-col justify-center p-8 lg:p-10 xl:p-12">
            {/* Featured label */}
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-3.5 text-[#FF6B35]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF6B35]">
                Featured
              </span>
            </div>

            {/* Category — desktop only */}
            <span
              className={`mb-4 hidden w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold lg:inline-flex ${colors.bg} ${colors.text}`}
            >
              <span className={`size-1.5 rounded-full ${colors.dot}`} />
              {post.category}
            </span>

            <h2 className="hidden font-display text-3xl font-bold leading-tight text-gray-900 lg:block xl:text-4xl">
              {post.title}
            </h2>

            <p className="mt-4 text-base leading-relaxed text-gray-500 line-clamp-3">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {post.readingTime} min read
              </span>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF6B35] transition-all group-hover:gap-3">
                Read Article
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

function PostCard({
  post,
  index,
}: {
  post: ReturnType<typeof getAllPosts>[0];
  index: number;
}) {
  const colors = CATEGORY_COLORS[post.category];

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <article
          className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow duration-300 hover:border-gray-200"
          style={{
            boxShadow: "var(--shadow-card)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow-card)";
          }}
        >
          {/* Cover image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Subtle gradient overlay at bottom for text contrast */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            {/* Category badge */}
            <span
              className={`mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${colors.bg} ${colors.text}`}
            >
              <span className={`size-1.5 rounded-full ${colors.dot}`} />
              {post.category}
            </span>

            {/* Title */}
            <h3 className="font-display text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#FF6B35] sm:text-xl">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500 line-clamp-2">
              {post.excerpt}
            </p>

            {/* Footer meta */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {post.readingTime}m
                </span>
              </div>
              <ArrowRight className="size-4 text-gray-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#FF6B35]" />
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "All">(
    "All"
  );

  const allPosts = getAllPosts();
  const featured = getFeaturedPosts();

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return allPosts;
    return allPosts.filter((p) => p.category === activeCategory);
  }, [allPosts, activeCategory]);

  // Separate the featured post from the grid
  const featuredPost = featured[0] ?? allPosts[0];
  const gridPosts = filteredPosts.filter((p) => p.slug !== featuredPost?.slug);

  // Categories that actually have posts
  const activeCategories = ALL_CATEGORIES.filter((cat) =>
    allPosts.some((p) => p.category === cat)
  );

  return (
    <>
      {/* ================================================================ */}
      {/* Hero Section                                                     */}
      {/* ================================================================ */}
      <section
        className="relative overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-32"
        style={{ background: "var(--gradient-section-dark)" }}
      >
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#FF6B35]/8 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-[#A855F7]/8 blur-[80px]" />
        <div className="pointer-events-none absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-[#FBBF24]/6 blur-[60px]" />

        {/* Dot grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            {/* Eyebrow */}
            <motion.div variants={staggerItem} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 text-xs font-semibold tracking-wide text-gray-300 ring-1 ring-white/[0.08]">
                <BookOpen className="size-3.5 text-[#FF6B35]" />
                Education Insights
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={staggerItem}
              className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
            >
              The{" "}
              <span className="text-gradient-brand">mydscvr.ai</span>{" "}
              Blog
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={staggerItem}
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg"
            >
              Expert guides, tips, and insights to help you navigate
              Dubai&apos;s education landscape with confidence.
            </motion.p>

            {/* Category filter pills */}
            {activeCategories.length > 0 && (
              <motion.div
                variants={staggerItem}
                className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
              >
                <CategoryPill
                  category="All"
                  active={activeCategory === "All"}
                  onClick={() => setActiveCategory("All")}
                />
                {activeCategories.map((cat) => (
                  <CategoryPill
                    key={cat}
                    category={cat}
                    active={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Bottom fade to white */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ================================================================ */}
      {/* Content area                                                      */}
      {/* ================================================================ */}
      <section className="relative -mt-8 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {allPosts.length === 0 ? (
            /* Empty state */
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mx-auto max-w-md py-24 text-center"
            >
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-orange-50">
                <BookOpen className="size-7 text-[#FF6B35]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900">
                Coming Soon
              </h2>
              <p className="mt-3 text-gray-500">
                We&apos;re preparing insightful articles about Dubai&apos;s
                education landscape. Check back soon!
              </p>
            </motion.div>
          ) : (
            <>
              {/* Featured post */}
              {activeCategory === "All" && featuredPost && (
                <div className="mb-12">
                  <FeaturedCard post={featuredPost} />
                </div>
              )}

              {/* Post grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -10 }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {(activeCategory === "All" ? gridPosts : filteredPosts).map(
                    (post, i) => (
                      <PostCard key={post.slug} post={post} index={i} />
                    )
                  )}
                </motion.div>
              </AnimatePresence>

              {/* No results for filter */}
              {filteredPosts.length === 0 && activeCategory !== "All" && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="py-16 text-center"
                >
                  <p className="text-gray-400">
                    No posts in &ldquo;{activeCategory}&rdquo; yet.{" "}
                    <button
                      type="button"
                      onClick={() => setActiveCategory("All")}
                      className="font-semibold text-[#FF6B35] hover:underline"
                    >
                      View all posts
                    </button>
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
