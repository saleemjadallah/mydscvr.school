import Link from "next/link";
import { Search, GitCompareArrows } from "lucide-react";

export default function LandingCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-10 text-center sm:px-10 sm:py-14"
        style={{
          background: "linear-gradient(135deg, #0A1628, #1a2740)",
        }}
      >
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#FF6B35]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-purple-500/15 blur-3xl" />

        <div className="relative">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Not sure which school is right?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
            Use our AI-powered tools to find the perfect school for your child.
            Compare schools side-by-side or let our AI search find your best match.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100"
            >
              <GitCompareArrows className="size-4" />
              Compare Schools
            </Link>
            <Link
              href="/schools"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #FF6B35, #F59E0B)",
                boxShadow: "0 2px 12px rgba(255, 107, 53, 0.3)",
              }}
            >
              <Search className="size-4" />
              AI School Search
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
