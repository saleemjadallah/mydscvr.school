"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  MousePointerClick,
  Users,
  Mail,
  TrendingUp,
  TrendingDown,
  Search,
  Globe,
  Phone,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { getSchoolClickStats } from "@/lib/api";
import type { SchoolAnalyticsStats, ClicksByType } from "@/types";

const PERIOD_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
] as const;

const CLICK_TYPE_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  website: { label: "Website", icon: <Globe className="size-4" />, color: "#FF6B35" },
  phone: { label: "Phone", icon: <Phone className="size-4" />, color: "#3B82F6" },
  email: { label: "Email", icon: <Mail className="size-4" />, color: "#8B5CF6" },
  whatsapp: { label: "WhatsApp", icon: <MessageCircle className="size-4" />, color: "#22C55E" },
  maps: { label: "Maps", icon: <MapPin className="size-4" />, color: "#F59E0B" },
};

interface SchoolAnalyticsProps {
  schoolId: string;
  schoolName: string;
}

export default function SchoolAnalytics({
  schoolId,
  schoolName,
}: SchoolAnalyticsProps) {
  const [days, setDays] = useState(30);

  const { data, isLoading, error } = useQuery<SchoolAnalyticsStats>({
    queryKey: ["school-analytics", schoolId, days],
    queryFn: () => getSchoolClickStats(schoolId, days),
  });

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <p className="text-sm text-gray-500">Unable to load analytics.</p>
      </div>
    );
  }

  const maxTypeCount = data
    ? Math.max(...data.by_type.map((t) => t.count), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header + period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-gray-900">
            Click Analytics
          </h2>
          <p className="text-sm text-gray-500">{schoolName}</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                days === opt.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<MousePointerClick className="size-5 text-[#FF6B35]" />}
          label="Total Clicks"
          value={data?.total_clicks}
          change={data?.previous_period.change_pct}
          isLoading={isLoading}
        />
        <SummaryCard
          icon={<Users className="size-5 text-blue-500" />}
          label="Unique Visitors"
          value={data?.unique_visitors}
          isLoading={isLoading}
        />
        <SummaryCard
          icon={<Mail className="size-5 text-purple-500" />}
          label="Enquiries"
          value={data?.enquiry_count}
          isLoading={isLoading}
        />
      </div>

      {/* Clicks by type */}
      <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Clicks by Type
        </h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                <div className="h-3 flex-1 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : data?.by_type.length ? (
          <div className="space-y-3">
            {data.by_type.map((item: ClicksByType) => {
              const meta = CLICK_TYPE_META[item.click_type] ?? {
                label: item.click_type,
                icon: <Globe className="size-4" />,
                color: "#6B7280",
              };
              const pct = Math.round((item.count / maxTypeCount) * 100);

              return (
                <div key={item.click_type} className="flex items-center gap-3">
                  <div className="flex w-24 items-center gap-2 text-sm text-gray-700">
                    {meta.icon}
                    <span className="truncate">{meta.label}</span>
                  </div>
                  <div className="relative flex-1 h-6 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: meta.color,
                        minWidth: item.count > 0 ? "8px" : "0",
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-semibold text-gray-900">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No clicks recorded yet.</p>
        )}
      </div>

      {/* Daily trend chart */}
      <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Daily Clicks
        </h3>
        {isLoading ? (
          <div className="h-48 animate-pulse rounded bg-gray-100" />
        ) : data?.by_day.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.by_day}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickFormatter={(val: string) => {
                  const d = new Date(val);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                labelFormatter={(val) =>
                  new Date(String(val)).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })
                }
              />
              <Bar
                dataKey="count"
                fill="#FF6B35"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-gray-400">No data for this period.</p>
          </div>
        )}
      </div>

      {/* Top search queries */}
      {data?.top_search_queries && data.top_search_queries.length > 0 && (
        <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-4 flex items-center gap-2">
            <Search className="size-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">
              Top Search Queries
            </h3>
          </div>
          <div className="space-y-2">
            {data.top_search_queries.slice(0, 3).map((q, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
              >
                <span className="text-sm text-gray-700">{q.query}</span>
                <span className="text-xs font-medium text-gray-500">
                  {q.count} click{q.count !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  change,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  change?: number;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-gray-50">
          {icon}
        </div>
        {change !== undefined && !isLoading && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              change > 0
                ? "text-emerald-600"
                : change < 0
                  ? "text-red-500"
                  : "text-gray-400"
            }`}
          >
            {change > 0 ? (
              <TrendingUp className="size-3" />
            ) : change < 0 ? (
              <TrendingDown className="size-3" />
            ) : null}
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      {isLoading ? (
        <div className="mt-1 h-7 w-16 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="mt-0.5 text-2xl font-bold text-gray-900">
          {(value ?? 0).toLocaleString()}
        </p>
      )}
    </div>
  );
}
