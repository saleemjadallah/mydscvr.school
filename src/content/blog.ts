export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  coverImage: string;
  category: BlogCategory;
  tags: string[];
  author: BlogAuthor;
  publishedAt: string; // ISO date
  updatedAt?: string;
  readingTime: number; // minutes
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface BlogAuthor {
  name: string;
  role: string;
  avatar?: string;
}

export type BlogCategory =
  | "School Guide"
  | "Curriculum Guide"
  | "Admissions"
  | "Education Tips"
  | "Dubai Living"
  | "Nursery Guide"
  | "News";

export const CATEGORY_COLORS: Record<BlogCategory, { bg: string; text: string; dot: string }> = {
  "School Guide": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  "Curriculum Guide": { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  "Admissions": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Education Tips": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  "Dubai Living": { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  "Nursery Guide": { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  "News": { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
};

const AUTHOR_MYDSCVR: BlogAuthor = {
  name: "mydscvr.ai",
  role: "Education Insights",
};

// ---------------------------------------------------------------------------
// Post content imports
// ---------------------------------------------------------------------------

import { content as schoolGuideContent } from "./posts/how-to-choose-the-right-school-in-dubai";
import { content as britishVsIbContent } from "./posts/british-vs-ib-curriculum-dubai";

// ---------------------------------------------------------------------------
// Blog posts — newest first
// ---------------------------------------------------------------------------

const posts: BlogPost[] = [
  {
    slug: "how-to-choose-the-right-school-in-dubai",
    title: "How to Choose the Right School in Dubai: The Complete Parent's Guide for 2025-2026",
    excerpt: "A comprehensive guide for expat parents navigating Dubai's 200+ private schools, covering KHDA ratings, curriculum comparisons, fees, and admissions timelines.",
    content: schoolGuideContent,
    coverImage: "/blog/how-to-choose-the-right-school-in-dubai.jpg",
    category: "School Guide",
    tags: ["Dubai schools", "KHDA ratings", "school fees Dubai", "British schools Dubai", "IB schools Dubai", "school admissions Dubai", "expat parents Dubai", "curriculum comparison"],
    author: AUTHOR_MYDSCVR,
    publishedAt: "2026-02-27T08:00:00Z",
    readingTime: 14,
    featured: true,
    metaTitle: "How to Choose the Right School in Dubai | 2025-2026 Guide",
    metaDescription: "Navigate Dubai's 200+ private schools with confidence. Expert guide covering KHDA ratings, curricula, fees, admissions, and practical tips for expat parents.",
  },
  {
    slug: "british-vs-ib-curriculum-dubai",
    title: "British vs IB Curriculum in Dubai: Which Is Right for Your Child?",
    excerpt: "A detailed comparison of British and IB curricula in Dubai covering structure, teaching style, fees, university pathways, and a decision framework for parents.",
    content: britishVsIbContent,
    coverImage: "/blog/british-vs-ib-curriculum-dubai.jpg",
    category: "Curriculum Guide",
    tags: ["British curriculum", "IB curriculum", "IGCSE", "A-Levels", "IB Diploma", "curriculum comparison", "Dubai schools", "KHDA", "university pathways"],
    author: AUTHOR_MYDSCVR,
    publishedAt: "2026-02-26T08:00:00Z",
    readingTime: 14,
    metaTitle: "British vs IB Curriculum in Dubai (2025 Guide)",
    metaDescription: "Compare British and IB curricula in Dubai: structure, fees, university pathways, KHDA ratings, and a parent decision checklist. Unbiased expert guide.",
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getAllPosts(): BlogPost[] {
  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getFeaturedPosts(): BlogPost[] {
  return getAllPosts().filter((p) => p.featured);
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const post = getPostBySlug(slug);
  if (!post) return [];
  return getAllPosts()
    .filter((p) => p.slug !== slug && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, limit);
}

export function getAllCategories(): BlogCategory[] {
  const cats = new Set(posts.map((p) => p.category));
  return Array.from(cats);
}

export { AUTHOR_MYDSCVR };
