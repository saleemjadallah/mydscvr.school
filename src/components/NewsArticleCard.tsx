"use client";

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/animations";
import type { ExaArticle } from "@/types";

function relativeDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

interface NewsArticleCardProps {
  article: ExaArticle;
  variant?: "featured" | "compact";
}

export default function NewsArticleCard({
  article,
  variant = "compact",
}: NewsArticleCardProps) {
  const isFeatured = variant === "featured";
  const highlight = article.highlights?.[0] ?? null;

  return (
    <motion.a
      variants={staggerItem}
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl bg-white p-5 transition-all hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow-card)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "var(--shadow-card-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* Source badge */}
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-[#FF6B35]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FF6B35]">
          {article.source}
        </span>
        {article.publishedDate && (
          <span className="text-[11px] text-gray-400">
            {relativeDate(article.publishedDate)}
          </span>
        )}
      </div>

      {/* Title */}
      {article.title && (
        <h3
          className={`font-semibold leading-snug text-gray-900 transition-colors group-hover:text-[#FF6B35] ${
            isFeatured
              ? "text-lg line-clamp-3"
              : "text-sm line-clamp-2"
          }`}
        >
          {article.title}
        </h3>
      )}

      {/* Excerpt / highlight */}
      {highlight && (
        <p
          className={`mt-2 text-gray-500 ${
            isFeatured
              ? "text-sm leading-relaxed line-clamp-4"
              : "text-xs leading-relaxed line-clamp-2"
          }`}
        >
          {highlight}
        </p>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center gap-1 pt-3 text-xs font-medium text-[#FF6B35] opacity-0 transition-opacity group-hover:opacity-100">
        Read article
        <ExternalLink className="size-3" />
      </div>
    </motion.a>
  );
}
