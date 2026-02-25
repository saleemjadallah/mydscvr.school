'use client';

import { motion } from 'framer-motion';
import {
  Heart,
  Bus,
  Waves,
  Dumbbell,
  Palette,
  Clock,
  Building,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { SCHOOL_COLORS, FACILITY_FEATURES } from '@/lib/constants';
import { staggerItem } from '@/lib/animations';
import type { CompareSchool } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Heart,
  Bus,
  Waves,
  Dumbbell,
  Palette,
  Clock,
  Building,
};

interface FacilitiesGridProps {
  schools: CompareSchool[];
}

export default function FacilitiesGrid({ schools }: FacilitiesGridProps) {
  // Compute match scores (how many features each school has)
  const scores = schools.map((s) =>
    FACILITY_FEATURES.reduce(
      (count, f) => count + (s[f.key as keyof CompareSchool] ? 1 : 0),
      0
    )
  );

  return (
    <div className="space-y-6">
      {/* Match score summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {schools.map((school, i) => {
          const color = SCHOOL_COLORS[i % SCHOOL_COLORS.length];
          const score = scores[i];
          const pct = Math.round((score / FACILITY_FEATURES.length) * 100);

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
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="text-2xl font-bold" style={{ color: color.hex }}>
                  {score}
                </span>
                <span className="text-sm text-gray-400">
                  / {FACILITY_FEATURES.length}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color.hex }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Feature grid — mobile: stacked cards */}
      <div className="space-y-2 sm:hidden">
        {FACILITY_FEATURES.map((feature, fi) => {
          const Icon = ICON_MAP[feature.icon] ?? CheckCircle2;
          return (
            <div key={feature.key} className="rounded-lg border border-gray-100 bg-white p-3">
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {feature.label}
                </span>
              </div>
              <div className="space-y-1.5">
                {schools.map((s, si) => {
                  const has = s[feature.key as keyof CompareSchool] as boolean;
                  return (
                    <div key={s.id} className="flex items-center justify-between">
                      <span
                        className="text-xs font-medium truncate max-w-[140px]"
                        style={{ color: SCHOOL_COLORS[si % SCHOOL_COLORS.length].hex }}
                      >
                        {s.name.split(' ').slice(0, 3).join(' ')}
                      </span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: fi * 0.05 + si * 0.1,
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                      >
                        {has ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-200" />
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature grid — desktop: table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-40 pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Facility
              </th>
              {schools.map((s, i) => (
                <th key={s.id} className="pb-3 text-center">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: SCHOOL_COLORS[i % SCHOOL_COLORS.length].hex }}
                  >
                    {s.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FACILITY_FEATURES.map((feature, fi) => {
              const Icon = ICON_MAP[feature.icon] ?? CheckCircle2;

              return (
                <tr
                  key={feature.key}
                  className={fi % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                >
                  <td className="border-b border-gray-50 px-0 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                        {feature.label}
                      </span>
                    </div>
                  </td>
                  {schools.map((s, si) => {
                    const has = s[feature.key as keyof CompareSchool] as boolean;
                    return (
                      <td key={s.id} className="border-b border-gray-50 py-3 text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: fi * 0.05 + si * 0.1,
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="inline-flex"
                        >
                          {has ? (
                            <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="mx-auto h-5 w-5 text-gray-200" />
                          )}
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
