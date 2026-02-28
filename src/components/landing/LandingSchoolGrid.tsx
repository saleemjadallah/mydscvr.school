"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SchoolCard from "@/components/SchoolCard";
import { useSavedSchools } from "@/hooks/useSavedSchools";
import type { School } from "@/types";

interface LandingSchoolGridProps {
  schools: School[];
  totalCount: number;
  viewAllHref: string;
  viewAllLabel: string;
}

export default function LandingSchoolGrid({
  schools,
  totalCount,
  viewAllHref,
  viewAllLabel,
}: LandingSchoolGridProps) {
  const { savedIds, toggleSave } = useSavedSchools();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-gray-900 sm:text-2xl">
          Top Schools
        </h2>
        {totalCount > schools.length && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm font-medium text-[#FF6B35] hover:underline"
          >
            View all {totalCount} schools
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {schools.map((school) => (
          <SchoolCard
            key={school.id}
            school={school}
            isSaved={savedIds.has(school.id)}
            onToggleSave={toggleSave}
          />
        ))}
      </div>

      {totalCount > schools.length && (
        <div className="mt-8 text-center">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #FF6B35, #F59E0B)",
              boxShadow: "0 2px 12px rgba(255, 107, 53, 0.25)",
            }}
          >
            {viewAllLabel}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
