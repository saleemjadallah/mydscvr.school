'use client';

import { motion } from 'framer-motion';
import { SCHOOL_COLORS, RADAR_AXES } from '@/lib/constants';
import { computeRadarValues } from '@/lib/school-utils';
import { chartPathDraw } from '@/lib/animations';
import type { CompareSchool } from '@/types';

interface RadarChartProps {
  schools: CompareSchool[];
}

const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = 110;
const LEVELS = 5;

function polarToCartesian(angle: number, r: number): [number, number] {
  // Start from top (-90 degrees)
  const rad = ((angle - 90) * Math.PI) / 180;
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
}

function axisAngle(index: number, total: number): number {
  return (360 / total) * index;
}

export default function RadarChart({ schools }: RadarChartProps) {
  const axisCount = RADAR_AXES.length;
  const feeMaxGlobal = Math.max(
    ...schools.map((s) => (typeof s.fee_max === 'number' ? s.fee_max : 0)),
    1
  );

  // Build polygon paths for each school
  const polygons = schools.map((school, si) => {
    const values = computeRadarValues(school as unknown as Record<string, unknown>, feeMaxGlobal);
    const points = values.map((v, ai) => {
      const angle = axisAngle(ai, axisCount);
      const r = (v / LEVELS) * RADIUS;
      return polarToCartesian(angle, r);
    });

    const pathD = points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`)
      .join(' ') + ' Z';

    return { pathD, points, color: SCHOOL_COLORS[si % SCHOOL_COLORS.length] };
  });

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-auto w-full max-w-[280px] md:max-w-[320px]"
      >
        {/* Grid levels */}
        {Array.from({ length: LEVELS }).map((_, level) => {
          const r = ((level + 1) / LEVELS) * RADIUS;
          const points = Array.from({ length: axisCount })
            .map((_, ai) => {
              const [x, y] = polarToCartesian(axisAngle(ai, axisCount), r);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="currentColor"
              className="text-gray-200"
              strokeWidth={level === LEVELS - 1 ? 1.5 : 0.5}
            />
          );
        })}

        {/* Axis lines */}
        {RADAR_AXES.map((_, ai) => {
          const [x, y] = polarToCartesian(axisAngle(ai, axisCount), RADIUS);
          return (
            <line
              key={ai}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="currentColor"
              className="text-gray-150"
              strokeWidth={0.5}
            />
          );
        })}

        {/* School polygons */}
        {polygons.map(({ pathD, color }, si) => (
          <g key={si}>
            <motion.path
              d={pathD}
              fill={`rgba(${color.rgb}, 0.15)`}
              stroke={color.hex}
              strokeWidth={2}
              variants={chartPathDraw}
              initial="hidden"
              animate="visible"
              transition={{ delay: si * 0.3 }}
            />
          </g>
        ))}

        {/* Data points */}
        {polygons.map(({ points, color }, si) =>
          points.map(([x, y], pi) => (
            <motion.circle
              key={`${si}-${pi}`}
              cx={x}
              cy={y}
              r={3.5}
              fill={color.hex}
              stroke="white"
              strokeWidth={1.5}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + si * 0.3 + pi * 0.05 }}
            />
          ))
        )}

        {/* Axis labels */}
        {RADAR_AXES.map((label, ai) => {
          const angle = axisAngle(ai, axisCount);
          const [x, y] = polarToCartesian(angle, RADIUS + 24);
          return (
            <text
              key={ai}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-gray-500 text-[9px] font-medium"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        {schools.map((school, i) => {
          const color = SCHOOL_COLORS[i % SCHOOL_COLORS.length];
          return (
            <div key={school.id} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-[11px] sm:text-xs font-medium text-gray-600 max-w-[100px] sm:max-w-[140px] truncate">
                {school.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
