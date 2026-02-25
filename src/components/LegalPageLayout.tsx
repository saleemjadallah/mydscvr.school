"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, ShieldCheck, Cookie, ChevronUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

const LEGAL_PAGES = [
  {
    href: "/terms",
    label: "Terms of Service",
    shortLabel: "Terms",
    icon: Scale,
  },
  {
    href: "/privacy",
    label: "Privacy Policy",
    shortLabel: "Privacy",
    icon: ShieldCheck,
  },
  {
    href: "/cookies",
    label: "Cookie Policy",
    shortLabel: "Cookies",
    icon: Cookie,
  },
] as const;

interface LegalPageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  version: string;
}

export default function LegalPageLayout({
  children,
  title,
  description,
  effectiveDate,
  lastUpdated,
  version,
}: LegalPageLayoutProps) {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-[80vh]">
      {/* ---- Hero header ---- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#162240] to-[#1a1535]">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-[#FF6B35]/[0.04] blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-[260px] w-[260px] rounded-full bg-[#A855F7]/[0.03] blur-[100px]" />

        <div className="relative mx-auto max-w-4xl px-4 pt-14 pb-0 sm:px-6 lg:px-8">
          {/* Label */}
          <p className="mb-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#FF6B35]">
            <Scale className="h-3.5 w-3.5" />
            Legal
          </p>

          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mb-6 max-w-2xl text-base leading-relaxed text-gray-400">
            {description}
          </p>

          {/* Metadata pills */}
          <div className="mb-10 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center rounded-full bg-white/[0.06] px-3 py-1">
              Effective {effectiveDate}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/[0.06] px-3 py-1">
              Updated {lastUpdated}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/[0.06] px-3 py-1">
              v{version}
            </span>
          </div>

          {/* Tab navigation */}
          <nav className="flex gap-0.5" aria-label="Legal documents">
            {LEGAL_PAGES.map((page) => {
              const active = pathname === page.href;
              const Icon = page.icon;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className={`group flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:px-5 sm:py-3 ${
                    active
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      active ? "text-[#FF6B35]" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">{page.label}</span>
                  <span className="sm:hidden">{page.shortLabel}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      {/* Accent divider */}
      <div className="h-px bg-gradient-to-r from-[#FF6B35]/40 via-[#FF6B35]/15 to-transparent" />

      {/* ---- Content ---- */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <article className="legal-prose prose prose-neutral max-w-none prose-headings:font-semibold prose-h2:scroll-mt-24 prose-a:font-medium prose-a:text-[#FF6B35] prose-a:no-underline hover:prose-a:underline prose-a:transition-colors">
          {children}
        </article>
      </div>

      {/* ---- Footer nav between legal pages ---- */}
      <div className="border-t border-gray-100">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-4 px-4 py-8 sm:gap-6 sm:px-6 lg:px-8">
          {LEGAL_PAGES.filter((p) => p.href !== pathname).map((page) => {
            const Icon = page.icon;
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-[#FF6B35]/30 hover:shadow-md"
              >
                <Icon className="h-4 w-4 text-gray-400 transition-colors group-hover:text-[#FF6B35]" />
                {page.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Scroll-to-top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-20 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-lg transition-all hover:bg-[#e55a2a] hover:shadow-xl sm:bottom-8"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
