"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  periods?: { label: string; value: string }[];
  onPeriodChange?: (value: string) => void;
  defaultPeriod?: string;
}

export default function ChartCard({
  title,
  children,
  loading,
  periods,
  onPeriodChange,
  defaultPeriod,
}: ChartCardProps) {
  const [activePeriod, setActivePeriod] = useState(defaultPeriod || periods?.[0]?.value || "30d");

  function handlePeriodChange(value: string) {
    setActivePeriod(value);
    onPeriodChange?.(value);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {periods && (
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePeriodChange(p.value)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  activePeriod === p.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-[250px] w-full rounded-lg" />
      ) : (
        children
      )}
    </div>
  );
}
