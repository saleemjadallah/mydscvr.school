"use client";

export const dynamic = "force-dynamic";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Share2,
  Tag,
} from "lucide-react";
import {
  getPostBySlug,
  getRelatedPosts,
  CATEGORY_COLORS,
} from "@/content/blog";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/animations";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function extractHeadings(markdown: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      headings.push({ id, text, level });
    }
  }
  return headings;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TableOfContents({
  headings,
}: {
  headings: { id: string; text: string; level: number }[];
}) {
  if (headings.length < 3) return null;

  return (
    <motion.nav
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="mb-10 rounded-2xl border border-gray-100 bg-gray-50/50 p-6"
    >
      <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
        <BookOpen className="size-3.5" />
        In this article
      </h4>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white hover:text-[#FF6B35] ${
                h.level === 3 ? "ml-4 text-gray-400" : "font-medium text-gray-600"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}

function RelatedPostCard({
  post,
}: {
  post: ReturnType<typeof getRelatedPosts>[0];
}) {
  const colors = CATEGORY_COLORS[post.category];

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <motion.article
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow duration-300"
        style={{ boxShadow: "var(--shadow-card)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-card)";
        }}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="p-5">
          <span
            className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${colors.bg} ${colors.text}`}
          >
            <span className={`size-1.5 rounded-full ${colors.dot}`} />
            {post.category}
          </span>
          <h3 className="font-display text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#FF6B35]">
            {post.title}
          </h3>
          <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#FF6B35]">
            Read more
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

function ShareButton() {
  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3.5 py-2 text-xs font-semibold text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700"
    >
      <Share2 className="size-3.5" />
      Share
    </button>
  );
}

// ---------------------------------------------------------------------------
// Custom renderers for react-markdown
// ---------------------------------------------------------------------------

const markdownComponents = {
  h2: ({ children, ...props }: React.ComponentPropsWithoutRef<"h2">) => {
    const text = typeof children === "string" ? children : String(children);
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return (
      <h2
        id={id}
        className="mb-4 mt-12 scroll-mt-24 font-display text-2xl font-bold text-gray-900 sm:text-3xl"
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<"h3">) => {
    const text = typeof children === "string" ? children : String(children);
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return (
      <h3
        id={id}
        className="mb-3 mt-8 scroll-mt-24 font-display text-xl font-bold text-gray-900 sm:text-2xl"
        {...props}
      >
        {children}
      </h3>
    );
  },
  p: ({ children, ...props }: React.ComponentPropsWithoutRef<"p">) => (
    <p className="mb-5 text-base leading-[1.8] text-gray-600" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="mb-5 ml-1 space-y-2 text-gray-600" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="mb-5 ml-1 list-decimal space-y-2 pl-5 text-gray-600" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentPropsWithoutRef<"li">) => (
    <li className="flex gap-2 text-base leading-[1.8]" {...props}>
      <span className="mt-[0.85em] size-1.5 shrink-0 rounded-full bg-[#FF6B35]/40" />
      <span>{children}</span>
    </li>
  ),
  blockquote: ({
    children,
    ...props
  }: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-8 border-l-[3px] border-[#FF6B35]/40 bg-orange-50/50 py-4 pl-6 pr-4 text-gray-700 italic rounded-r-xl"
      {...props}
    >
      {children}
    </blockquote>
  ),
  strong: ({ children, ...props }: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-gray-900" {...props}>
      {children}
    </strong>
  ),
  a: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a
      href={href}
      className="font-medium text-[#FF6B35] underline decoration-[#FF6B35]/30 underline-offset-2 transition-colors hover:decoration-[#FF6B35]"
      {...props}
    >
      {children}
    </a>
  ),
  hr: () => (
    <hr className="my-10 border-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
  ),
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BlogPostPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-orange-50">
          <BookOpen className="size-7 text-[#FF6B35]" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900">
          Post not found
        </h1>
        <p className="mt-3 text-gray-500">
          This article doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e55a2a]"
        >
          <ArrowLeft className="size-4" />
          Back to Blog
        </Link>
      </div>
    );
  }

  const colors = CATEGORY_COLORS[post.category];
  const headings = extractHeadings(post.content);
  const related = getRelatedPosts(post.slug, 3);

  return (
    <>
      {/* ================================================================ */}
      {/* Article Hero                                                     */}
      {/* ================================================================ */}
      <section
        className="relative overflow-hidden pb-12 pt-24 sm:pb-16 sm:pt-32"
        style={{ background: "var(--gradient-section-dark)" }}
      >
        {/* Decorative */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#FF6B35]/8 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-[#A855F7]/8 blur-[80px]" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Breadcrumb */}
            <motion.div
              variants={staggerItem}
              className="mb-6 flex items-center gap-1.5 text-sm text-gray-400"
            >
              <Link
                href="/blog"
                className="transition-colors hover:text-white"
              >
                Blog
              </Link>
              <ChevronRight className="size-3" />
              <span className="text-gray-500">{post.category}</span>
            </motion.div>

            {/* Category badge */}
            <motion.div variants={staggerItem}>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}
              >
                <span className={`size-1.5 rounded-full ${colors.dot}`} />
                {post.category}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={staggerItem}
              className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
            >
              {post.title}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              variants={staggerItem}
              className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-400"
            >
              {post.excerpt}
            </motion.p>

            {/* Meta row */}
            <motion.div
              variants={staggerItem}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FBBF24]">
                  <span className="text-sm font-bold text-white">
                    {post.author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {post.author.name}
                  </p>
                  <p className="text-xs text-gray-400">{post.author.role}</p>
                </div>
              </div>

              <div className="h-6 w-px bg-white/10" />

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {post.readingTime} min read
                </span>
              </div>

              <div className="ml-auto hidden sm:block">
                <ShareButton />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Cover Image                                                      */}
      {/* ================================================================ */}
      <div className="mx-auto -mt-1 max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative aspect-[2/1] overflow-hidden rounded-2xl sm:aspect-[2.4/1]"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 960px"
            priority
          />
        </motion.div>
      </div>

      {/* ================================================================ */}
      {/* Article Content                                                  */}
      {/* ================================================================ */}
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Table of contents */}
        <TableOfContents headings={headings} />

        {/* Markdown body */}
        <div className="blog-prose">
          <ReactMarkdown components={markdownComponents}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-8">
            <Tag className="size-4 text-gray-300" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Share — mobile */}
        <div className="mt-6 sm:hidden">
          <ShareButton />
        </div>

        {/* Back to blog */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:border-gray-300 hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
            All Articles
          </Link>
        </div>
      </article>

      {/* ================================================================ */}
      {/* Related Posts                                                    */}
      {/* ================================================================ */}
      {related.length > 0 && (
        <section
          className="border-t border-gray-100 py-16 sm:py-20"
          style={{ background: "var(--gradient-section-light)" }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <motion.div variants={staggerItem} className="mb-10 text-center">
                <h2 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">
                  Continue Reading
                </h2>
                <p className="mt-2 text-gray-500">
                  More articles you might enjoy
                </p>
              </motion.div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((rp) => (
                  <motion.div key={rp.slug} variants={staggerItem}>
                    <RelatedPostCard post={rp} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
}
