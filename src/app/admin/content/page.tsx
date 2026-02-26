"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ChartCard from "@/components/admin/ChartCard";

const DEVICE_COLORS = ["#FF6B35", "#3B82F6", "#10B981", "#94A3B8"];
const REFERRER_COLORS = ["#FF6B35", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#94A3B8"];

const PERIODS = [
  { label: "7d", value: "7" },
  { label: "30d", value: "30" },
  { label: "90d", value: "90" },
];

export default function AdminContentPage() {
  const [days, setDays] = useState("30");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-content-pageviews", days],
    queryFn: async () => {
      const res = await fetch(`/api/admin/content/page-views?days=${days}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Content & SEO" description="Page views, traffic sources, and content performance" />

      <ChartCard
        title="Page Views Over Time"
        loading={isLoading}
        periods={PERIODS}
        defaultPeriod={days}
        onPeriodChange={setDays}
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data?.over_time ?? []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
            <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #E2E8F0" }} />
            <Line type="monotone" dataKey="count" stroke="#FF6B35" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top pages */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Top 20 Pages</h3>
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {(data?.top_pages ?? []).map((p: { path: string; page_type: string; count: number }, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-slate-700 truncate">{p.path}</p>
                  <p className="text-[11px] text-slate-400">{p.page_type}</p>
                </div>
                <span className="text-[13px] font-semibold text-slate-900 ml-3">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top school profiles */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Top School Profiles by Views</h3>
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {(data?.top_school_profiles ?? []).map((s: { name: string; slug: string; views: number }, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-[13px] text-slate-700 truncate max-w-[250px]">{s.name}</span>
                <span className="text-[13px] font-semibold text-slate-900">{s.views}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Device breakdown */}
        <ChartCard title="Device Breakdown" loading={isLoading}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.device_breakdown ?? []}
                dataKey="count"
                nameKey="device"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
                label={({ name, percent }) =>
                  `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                labelLine={{ stroke: "#94A3B8" }}
              >
                {(data?.device_breakdown ?? []).map((_: unknown, i: number) => (
                  <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Referrer sources */}
        <ChartCard title="Traffic Sources" loading={isLoading}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.referrer_sources ?? []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis dataKey="source" type="category" width={80} tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {(data?.referrer_sources ?? []).map((_: unknown, i: number) => (
                  <Cell key={i} fill={REFERRER_COLORS[i % REFERRER_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* UTM campaigns */}
      {(data?.utm_campaigns ?? []).length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">UTM Campaign Performance</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-[12px]">
                  <th className="pb-2">Source</th>
                  <th className="pb-2">Medium</th>
                  <th className="pb-2">Campaign</th>
                  <th className="pb-2 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {data.utm_campaigns.map((c: Record<string, unknown>, i: number) => (
                  <tr key={i} className="border-t border-slate-50">
                    <td className="py-1.5">{c.utm_source as string}</td>
                    <td>{c.utm_medium as string}</td>
                    <td>{c.utm_campaign as string}</td>
                    <td className="text-right font-medium">{(c.count as number).toLocaleString()}</td>
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
