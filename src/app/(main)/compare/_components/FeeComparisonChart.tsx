'use client';

import { motion } from 'framer-motion';
import { SCHOOL_COLORS } from '@/lib/constants';
import { formatFee, feeLabel } from '@/lib/school-utils';
import { barGrow } from '@/lib/animations';
import type { CompareSchool, FeeHistoryEntry } from '@/types';

interface FeeComparisonChartProps {
  schools: CompareSchool[];
  feeHistory: Record<string, FeeHistoryEntry[]>;
}

export default function FeeComparisonChart({
  schools,
  feeHistory,
}: FeeComparisonChartProps) {
  // Find the max fee across all schools for bar scaling
  const maxFee = Math.max(
    ...schools.map((s) => s.fee_max ?? s.fee_min ?? 0),
    1
  );

  // Find cheapest / most expensive
  const sortedByFee = [...schools]
    .filter((s) => s.fee_max != null || s.fee_min != null)
    .sort((a, b) => (a.fee_max ?? a.fee_min ?? 0) - (b.fee_max ?? b.fee_min ?? 0));

  const cheapest = sortedByFee[0];
  const mostExpensive = sortedByFee[sortedByFee.length - 1];

  const feeDiff =
    cheapest && mostExpensive && sortedByFee.length > 1
      ? (mostExpensive.fee_max ?? mostExpensive.fee_min ?? 0) -
        (cheapest.fee_max ?? cheapest.fee_min ?? 0)
      : null;

  return (
    <div className="space-y-6">
      {/* Horizontal bar chart */}
      <div className="space-y-4">
        {schools.map((school, i) => {
          const color = SCHOOL_COLORS[i % SCHOOL_COLORS.length];
          const feeMin = school.fee_min ?? 0;
          const feeMax = school.fee_max ?? feeMin;
          const widthMin = (feeMin / (maxFee * 1.15)) * 100;
          const widthMax = (feeMax / (maxFee * 1.15)) * 100;

          return (
            <div key={school.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-gray-700 truncate min-w-0">
                  {school.name}
                </span>
                <span className="flex-shrink-0 text-xs font-semibold text-gray-900">
                  {feeLabel(school.fee_min, school.fee_max)}
                </span>
              </div>

              {/* Bar */}
              <div className="relative h-7 w-full rounded-lg bg-gray-100">
                {school.fee_min != null && school.fee_max != null && school.fee_min !== school.fee_max ? (
                  <>
                    {/* Range bar */}
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-lg"
                      style={{
                        left: `${widthMin}%`,
                        width: `${widthMax - widthMin}%`,
                        backgroundColor: `${color.hex}25`,
                        borderLeft: `2px solid ${color.hex}`,
                        borderRight: `2px solid ${color.hex}`,
                      }}
                      variants={barGrow}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: i * 0.15 }}
                    />
                    {/* Min marker */}
                    <div
                      className="absolute bottom-full mb-0.5 text-[9px] font-medium text-gray-400"
                      style={{ left: `${widthMin}%`, transform: 'translateX(-50%)' }}
                    >
                      {formatFee(school.fee_min)}
                    </div>
                  </>
                ) : (
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-lg"
                    style={{
                      width: `${widthMax}%`,
                      backgroundColor: color.hex,
                      opacity: 0.7,
                    }}
                    variants={barGrow}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: i * 0.15 }}
                    custom={{ originX: 0 }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fee difference callout */}
      {feeDiff != null && feeDiff > 0 && cheapest && mostExpensive && (
        <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 text-center">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{mostExpensive.name}</span> is{' '}
            <span className="font-bold text-amber-900">
              AED {formatFee(feeDiff)}
            </span>{' '}
            more (max fee) than{' '}
            <span className="font-semibold">{cheapest.name}</span>
          </p>
        </div>
      )}

      {/* Fee history trends (if available) */}
      {schools.some((s) => feeHistory[s.id]?.length > 0) && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Fee History</h4>

          {/* Mobile: stacked cards per year */}
          <div className="space-y-2 sm:hidden">
            {getYears(schools, feeHistory).map((year) => (
              <div key={year} className="rounded-lg border border-gray-100 bg-white p-3">
                <p className="mb-2 text-xs font-semibold text-gray-500">{year}</p>
                <div className="space-y-1.5">
                  {schools.map((s, i) => {
                    const entries = feeHistory[s.id]?.filter((f) => f.year === year) ?? [];
                    const avgFee = entries.length > 0
                      ? Math.round(entries.reduce((sum, e) => sum + e.fee_aed, 0) / entries.length)
                      : null;
                    return (
                      <div key={s.id} className="flex items-center justify-between">
                        <span
                          className="text-xs font-medium truncate max-w-[120px]"
                          style={{ color: SCHOOL_COLORS[i % SCHOOL_COLORS.length].hex }}
                        >
                          {s.name.split(' ').slice(0, 3).join(' ')}
                        </span>
                        <span className="text-xs text-gray-700">
                          {avgFee != null ? `AED ${formatFee(avgFee)}` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 pr-4 text-left font-medium text-gray-500">Year</th>
                  {schools.map((s, i) => (
                    <th
                      key={s.id}
                      className="pb-2 px-2 text-center font-medium"
                      style={{ color: SCHOOL_COLORS[i % SCHOOL_COLORS.length].hex }}
                    >
                      {s.name.split(' ').slice(0, 2).join(' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getYears(schools, feeHistory).map((year) => (
                  <tr key={year} className="border-b border-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-600">{year}</td>
                    {schools.map((s) => {
                      const entries = feeHistory[s.id]?.filter((f) => f.year === year) ?? [];
                      const avgFee = entries.length > 0
                        ? Math.round(entries.reduce((sum, e) => sum + e.fee_aed, 0) / entries.length)
                        : null;
                      return (
                        <td key={s.id} className="px-2 py-2 text-center text-gray-700">
                          {avgFee != null ? `AED ${formatFee(avgFee)}` : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function getYears(
  schools: CompareSchool[],
  feeHistory: Record<string, FeeHistoryEntry[]>
): number[] {
  const years = new Set<number>();
  for (const s of schools) {
    for (const entry of feeHistory[s.id] ?? []) {
      years.add(entry.year);
    }
  }
  return [...years].sort((a, b) => b - a).slice(0, 5);
}
