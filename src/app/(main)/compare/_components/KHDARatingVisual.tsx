'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { KHDA_COLOR_MAP, KHDA_NUMERIC, SCHOOL_COLORS } from '@/lib/constants';
import { staggerItem } from '@/lib/animations';
import type { CompareSchool, KHDAReportSummary, ReviewSummary } from '@/types';

interface KHDARatingVisualProps {
  schools: CompareSchool[];
  khdaReports: Record<string, KHDAReportSummary[]>;
  reviewSummary: Record<string, ReviewSummary>;
}

const RATING_LADDER = ['Outstanding', 'Very Good', 'Good', 'Acceptable', 'Weak'] as const;

export default function KHDARatingVisual({
  schools,
  khdaReports,
  reviewSummary,
}: KHDARatingVisualProps) {
  return (
    <div className="space-y-8">
      {/* KHDA Rating Ladder */}
      <div>
        <h4 className="mb-4 text-sm font-semibold text-gray-700">KHDA Rating Comparison</h4>
        <div className="space-y-2">
          {RATING_LADDER.map((rating) => {
            const colors = KHDA_COLOR_MAP[rating];
            const schoolsAtRating = schools.filter((s) => s.khda_rating === rating);

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="w-24 flex-shrink-0 text-right">
                  <Badge
                    className={`${colors.bg} ${colors.text} border-0 text-[10px] font-semibold`}
                  >
                    {rating}
                  </Badge>
                </div>

                <div className="relative flex-1">
                  <div className="h-10 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex h-full items-center gap-2 px-3">
                      {schoolsAtRating.map((school) => {
                        const idx = schools.indexOf(school);
                        const color = SCHOOL_COLORS[idx % SCHOOL_COLORS.length];
                        return (
                          <motion.div
                            key={school.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.15, type: 'spring', stiffness: 500 }}
                            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                            style={{ backgroundColor: `${color.hex}15` }}
                          >
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-[11px] font-medium text-gray-700 max-w-[100px] truncate">
                              {school.name.split(' ').slice(0, 2).join(' ')}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Ratings */}
      <div>
        <h4 className="mb-4 text-sm font-semibold text-gray-700">Google Ratings</h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {schools.map((school, i) => {
            const color = SCHOOL_COLORS[i % SCHOOL_COLORS.length];
            const rating = school.google_rating;
            const count = school.google_review_count;

            return (
              <motion.div
                key={school.id}
                variants={staggerItem}
                className="rounded-xl border border-gray-100 bg-white p-4 text-center"
                style={{ borderTopWidth: '2px', borderTopColor: color.hex }}
              >
                <p className="text-xs font-medium text-gray-500 truncate">
                  {school.name.split(' ').slice(0, 3).join(' ')}
                </p>
                {rating != null ? (
                  <>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="text-2xl font-bold text-gray-900">
                        {Number(rating).toFixed(1)}
                      </span>
                    </div>
                    {count != null && (
                      <p className="mt-1 text-xs text-gray-400">
                        {Number(count).toLocaleString()} reviews
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-3 text-sm text-gray-300">No rating</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Review Sentiment */}
      {schools.some((s) => reviewSummary[s.id]?.total > 0) && (
        <div>
          <h4 className="mb-4 text-sm font-semibold text-gray-700">Review Sentiment</h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {schools.map((school, i) => {
              const color = SCHOOL_COLORS[i % SCHOOL_COLORS.length];
              const summary = reviewSummary[school.id];
              if (!summary || summary.total === 0) {
                return (
                  <div key={school.id} className="rounded-xl border border-gray-100 bg-white p-4 text-center">
                    <p className="text-xs font-medium text-gray-500 truncate">
                      {school.name.split(' ').slice(0, 3).join(' ')}
                    </p>
                    <p className="mt-3 text-sm text-gray-300">No review data</p>
                  </div>
                );
              }

              const pPct = Math.round((summary.positive / summary.total) * 100);
              const nPct = Math.round((summary.neutral / summary.total) * 100);
              const negPct = 100 - pPct - nPct;

              return (
                <motion.div
                  key={school.id}
                  variants={staggerItem}
                  className="rounded-xl border border-gray-100 bg-white p-4"
                  style={{ borderTopWidth: '2px', borderTopColor: color.hex }}
                >
                  <p className="text-xs font-medium text-gray-500 truncate mb-3">
                    {school.name.split(' ').slice(0, 3).join(' ')}
                  </p>

                  {/* Stacked bar */}
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full">
                    <div className="bg-emerald-400" style={{ width: `${pPct}%` }} />
                    <div className="bg-gray-300" style={{ width: `${nPct}%` }} />
                    <div className="bg-red-400" style={{ width: `${negPct}%` }} />
                  </div>

                  <div className="mt-2 flex justify-between text-[10px]">
                    <span className="text-emerald-600">{pPct}% positive</span>
                    <span className="text-red-500">{negPct}% negative</span>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">
                    {summary.total} reviews analyzed
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* KHDA Report Timeline */}
      {schools.some((s) => khdaReports[s.id]?.length > 0) && (
        <div>
          <h4 className="mb-4 text-sm font-semibold text-gray-700">Inspection History</h4>
          <div className="overflow-x-auto">
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
                {getReportYears(schools, khdaReports).map((year) => (
                  <tr key={year} className="border-b border-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-600">{year}</td>
                    {schools.map((s) => {
                      const report = khdaReports[s.id]?.find((r) => r.year === year);
                      if (!report) {
                        return <td key={s.id} className="px-2 py-2 text-center text-gray-300">—</td>;
                      }
                      const colors = KHDA_COLOR_MAP[report.rating];
                      return (
                        <td key={s.id} className="px-2 py-2 text-center">
                          {colors ? (
                            <Badge className={`${colors.bg} ${colors.text} border-0 text-[10px]`}>
                              {report.rating}
                            </Badge>
                          ) : (
                            <span className="text-gray-600">{report.rating}</span>
                          )}
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

function getReportYears(
  schools: CompareSchool[],
  khdaReports: Record<string, KHDAReportSummary[]>
): number[] {
  const years = new Set<number>();
  for (const s of schools) {
    for (const r of khdaReports[s.id] ?? []) {
      years.add(r.year);
    }
  }
  return [...years].sort((a, b) => b - a).slice(0, 6);
}
