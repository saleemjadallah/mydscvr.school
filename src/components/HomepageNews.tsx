"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import { getHomepageNews } from "@/lib/api";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import NewsArticleCard from "./NewsArticleCard";

export default function HomepageNews() {
  const { data, isLoading } = useQuery({
    queryKey: ["homepage-news"],
    queryFn: getHomepageNews,
    staleTime: 10 * 60 * 1000, // 10 min
    retry: 2,
  });

  const articles = data?.articles;

  // Hide only if explicitly got an empty response (API now returns fallback articles)
  if (!isLoading && (!articles || articles.length === 0)) return null;

  // Split articles for editorial layout
  const featured = articles?.[0];
  const sidebar = articles?.slice(1, 3) ?? [];
  const bottomRow = articles?.slice(3, 6) ?? [];
  // Mobile: max 4 articles total
  const mobileArticles = articles?.slice(0, 4) ?? [];

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{ background: "var(--gradient-section-light)" }}
    >
      {/* Subtle watercolor accent */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/backdrops/light-section-accent.webp"
          alt=""
          fill
          className="object-cover opacity-30"
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
          <h2 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Latest{" "}
            <span className="text-gradient-brand">Education News</span>
          </h2>
          <p className="mt-3 text-base text-gray-500">
            Stay informed with the latest developments in Dubai education
          </p>
        </motion.div>

        {isLoading ? (
          /* Loading shimmer */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-white p-5"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="mb-3 h-3 w-20 rounded bg-gray-200" />
                <div className="mb-2 h-5 w-full rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-100" />
                  <div className="h-3 w-2/3 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop editorial layout (lg+) */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="hidden lg:block"
            >
              {/* Top row: 1 featured + 2 sidebar */}
              <div className="grid grid-cols-3 gap-4">
                {featured && (
                  <div className="col-span-1">
                    <NewsArticleCard article={featured} variant="featured" />
                  </div>
                )}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  {sidebar.map((article) => (
                    <NewsArticleCard
                      key={article.url}
                      article={article}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>

              {/* Bottom row: 3 compact cards */}
              {bottomRow.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {bottomRow.map((article) => (
                    <NewsArticleCard
                      key={article.url}
                      article={article}
                      variant="compact"
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Tablet layout (sm to lg) */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="hidden sm:grid sm:grid-cols-2 sm:gap-4 lg:hidden"
            >
              {articles?.slice(0, 6).map((article) => (
                <NewsArticleCard
                  key={article.url}
                  article={article}
                  variant="compact"
                />
              ))}
            </motion.div>

            {/* Mobile layout (single column, max 4) */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="flex flex-col gap-4 sm:hidden"
            >
              {mobileArticles.map((article) => (
                <NewsArticleCard
                  key={article.url}
                  article={article}
                  variant="compact"
                />
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
