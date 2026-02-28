import Link from "next/link";
import { ChevronRight, GraduationCap, DollarSign, Star } from "lucide-react";
import { formatFee } from "@/lib/school-utils";

interface LandingHeroProps {
  h1: string;
  breadcrumbLabel: string;
  totalCount: number;
  avgFee: number | null;
  topRatedCount: number;
}

export default function LandingHero({
  h1,
  breadcrumbLabel,
  totalCount,
  avgFee,
  topRatedCount,
}: LandingHeroProps) {
  return (
    <section
      className="relative overflow-hidden py-12 sm:py-16 lg:py-20"
      style={{ background: "var(--gradient-section-dark)" }}
    >
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#FF6B35]/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-white/60">
          <Link href="/" className="hover:text-white/80 transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <Link href="/schools" className="hover:text-white/80 transition-colors">
            Schools
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-white/90 font-medium">{breadcrumbLabel}</span>
        </nav>

        {/* H1 */}
        <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl max-w-3xl">
          {h1}
        </h1>

        {/* Stat pills */}
        <div className="mt-8 flex flex-wrap gap-3">
          <StatPill
            icon={<GraduationCap className="size-4" />}
            value={totalCount.toString()}
            label={totalCount === 1 ? "School" : "Schools"}
          />
          {avgFee != null && (
            <StatPill
              icon={<DollarSign className="size-4" />}
              value={`AED ${formatFee(avgFee)}`}
              label="Avg. Annual Fee"
            />
          )}
          {topRatedCount > 0 && (
            <StatPill
              icon={<Star className="size-4" />}
              value={topRatedCount.toString()}
              label="Top Rated"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/10">
      <span className="text-[#FF6B35]">{icon}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
      <span className="text-xs text-white/60">{label}</span>
    </div>
  );
}
