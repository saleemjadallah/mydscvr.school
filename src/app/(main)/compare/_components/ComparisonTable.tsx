'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KHDA_COLOR_MAP, SCHOOL_COLORS } from '@/lib/constants';
import { feeLabel } from '@/lib/school-utils';
import type { CompareSchool } from '@/types';

interface ComparisonTableProps {
  schools: CompareSchool[];
}

function FeatureCell({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />
  ) : (
    <XCircle className="mx-auto h-5 w-5 text-gray-200" />
  );
}

// Mobile: stacked card layout for a single row
function MobileRowCard({
  row,
  schools,
}: {
  row: { label: string; render: (s: CompareSchool) => React.ReactNode };
  schools: CompareSchool[];
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {row.label}
      </p>
      <div className="space-y-2">
        {schools.map((s, i) => (
          <div key={s.id} className="flex items-center justify-between gap-2">
            <span
              className="text-xs font-medium truncate max-w-[120px]"
              style={{ color: SCHOOL_COLORS[i % SCHOOL_COLORS.length].hex }}
            >
              {s.name.split(' ').slice(0, 3).join(' ')}
            </span>
            <div className="flex-shrink-0">{row.render(s)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparisonTable({ schools }: ComparisonTableProps) {
  const [expanded, setExpanded] = useState(false);

  const rows: { label: string; render: (s: CompareSchool) => React.ReactNode }[] = [
    {
      label: 'Area',
      render: (s) => (
        <span className="flex items-center gap-1 text-sm text-gray-700">
          <MapPin className="h-3.5 w-3.5 text-gray-400" />
          {s.area ?? '—'}
        </span>
      ),
    },
    {
      label: 'Curriculum',
      render: (s) => (
        <div className="flex flex-wrap justify-end sm:justify-center gap-1">
          {s.curriculum?.length ? (
            s.curriculum.map((c) => (
              <Badge
                key={c}
                variant="outline"
                className="text-[10px] px-1.5 py-0 text-gray-600"
              >
                {c}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      ),
    },
    {
      label: 'KHDA Rating',
      render: (s) => {
        if (!s.khda_rating) return <span className="text-sm text-gray-400">—</span>;
        const colors = KHDA_COLOR_MAP[s.khda_rating];
        return (
          <Badge className={`${colors?.bg ?? 'bg-gray-100'} ${colors?.text ?? 'text-gray-700'} border-0 text-xs`}>
            {s.khda_rating}
          </Badge>
        );
      },
    },
    {
      label: 'Annual Fees',
      render: (s) => (
        <span className="text-sm font-semibold text-gray-900">
          {feeLabel(s.fee_min, s.fee_max)}
        </span>
      ),
    },
    {
      label: 'Google Rating',
      render: (s) =>
        s.google_rating != null ? (
          <span className="flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-gray-700">
              {Number(s.google_rating).toFixed(1)}
            </span>
            {s.google_review_count != null && (
              <span className="text-gray-400">
                ({Number(s.google_review_count).toLocaleString()})
              </span>
            )}
          </span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        ),
    },
    {
      label: 'Gender',
      render: (s) => (
        <span className="text-sm capitalize text-gray-700">{s.gender}</span>
      ),
    },
    {
      label: 'SEN Support',
      render: (s) => <FeatureCell value={s.has_sen_support} />,
    },
    {
      label: 'Transport',
      render: (s) => <FeatureCell value={s.has_transport} />,
    },
    {
      label: 'Swimming Pool',
      render: (s) => <FeatureCell value={s.has_swimming_pool} />,
    },
    {
      label: 'Sports Facilities',
      render: (s) => <FeatureCell value={s.has_sports_facilities} />,
    },
    {
      label: 'Arts Program',
      render: (s) => <FeatureCell value={s.has_arts_program} />,
    },
    {
      label: 'After School',
      render: (s) => <FeatureCell value={s.has_after_school} />,
    },
    {
      label: 'Boarding',
      render: (s) => <FeatureCell value={s.has_boarding} />,
    },
  ];

  const visibleRows = expanded ? rows : rows.slice(0, 6);

  return (
    <div className="space-y-3">
      {/* Mobile: stacked card layout */}
      <div className="space-y-2 sm:hidden">
        <AnimatePresence>
          {visibleRows.map((row, ri) => (
            <motion.div
              key={row.label}
              initial={ri >= 6 ? { opacity: 0, height: 0 } : false}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <MobileRowCard row={row} schools={schools} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Desktop: table layout */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-32 md:w-40 border-b border-gray-200 bg-gray-50 px-3 md:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500" />
              {schools.map((s, i) => (
                <th
                  key={s.id}
                  className="border-b border-gray-200 bg-gray-50 px-3 md:px-4 py-3 text-center"
                >
                  <Link
                    href={`/schools/${s.slug}`}
                    className="text-xs md:text-sm font-bold hover:underline"
                    style={{ color: SCHOOL_COLORS[i % SCHOOL_COLORS.length].hex }}
                  >
                    {s.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {visibleRows.map((row, ri) => (
                <motion.tr
                  key={row.label}
                  initial={ri >= 6 ? { opacity: 0, height: 0 } : false}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                >
                  <td className="sticky left-0 z-10 border-b border-gray-100 bg-inherit px-3 md:px-4 py-3 text-sm font-medium text-gray-600">
                    {row.label}
                  </td>
                  {schools.map((s) => (
                    <td
                      key={s.id}
                      className="border-b border-gray-100 px-3 md:px-4 py-3 text-center"
                    >
                      {row.render(s)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {rows.length > 6 && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-1 h-3.5 w-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-3.5 w-3.5" />
                View all {rows.length} attributes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
