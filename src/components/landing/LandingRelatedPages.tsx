import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import type { LandingPageConfig } from "@/content/landing-pages/types";

interface LandingRelatedPagesProps {
  pages: LandingPageConfig[];
}

export default function LandingRelatedPages({ pages }: LandingRelatedPagesProps) {
  if (pages.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h2 className="mb-6 font-display text-xl font-semibold text-gray-900 sm:text-2xl">
        Related Searches
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/best-schools/${page.slug}`}
            className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-[#FF6B35]/30 hover:shadow-md"
          >
            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#FF6B35]/10">
              <GraduationCap className="size-5 text-[#FF6B35]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#FF6B35] transition-colors">
                {page.h1}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                {page.metaDescription}
              </p>
            </div>
            <ArrowRight className="mt-0.5 size-4 flex-shrink-0 text-gray-300 group-hover:text-[#FF6B35] transition-colors" />
          </Link>
        ))}
      </div>
    </section>
  );
}
