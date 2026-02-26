"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ChartCard from "@/components/admin/ChartCard";
import KPICard from "@/components/admin/KPICard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MousePointerClick, Filter } from "lucide-react";

const CLICK_COLORS: Record<string, string> = {
  website: "#FF6B35",
  phone: "#3B82F6",
  email: "#8B5CF6",
  whatsapp: "#22C55E",
  maps: "#F59E0B",
};

const PERIODS = [
  { label: "7d", value: "7" },
  { label: "30d", value: "30" },
  { label: "90d", value: "90" },
];

export default function AdminAnalyticsPage() {
  const [searchDays, setSearchDays] = useState("30");
  const [clickDays, setClickDays] = useState("30");
  const [funnelDays, setFunnelDays] = useState("30");

  const searchQuery = useQuery({
    queryKey: ["admin-analytics-search", searchDays],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/search?days=${searchDays}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const clickQuery = useQuery({
    queryKey: ["admin-analytics-clicks", clickDays],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/clicks?days=${clickDays}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const funnelQuery = useQuery({
    queryKey: ["admin-analytics-funnel", funnelDays],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/funnel?days=${funnelDays}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Analytics" description="Search, click, and funnel insights" />

      <Tabs defaultValue="search">
        <TabsList>
          <TabsTrigger value="search"><Search className="size-3.5 mr-1.5" />Search</TabsTrigger>
          <TabsTrigger value="clicks"><MousePointerClick className="size-3.5 mr-1.5" />Clicks</TabsTrigger>
          <TabsTrigger value="funnel"><Filter className="size-3.5 mr-1.5" />Funnel</TabsTrigger>
        </TabsList>

        {/* SEARCH TAB */}
        <TabsContent value="search" className="mt-4 space-y-4">
          <ChartCard
            title="Searches Over Time"
            loading={searchQuery.isLoading}
            periods={PERIODS}
            defaultPeriod={searchDays}
            onPeriodChange={setSearchDays}
          >
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={searchQuery.data?.searches_over_time ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #E2E8F0" }} />
                <Line type="monotone" dataKey="count" stroke="#FF6B35" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Top 20 Queries</h3>
              <div className="space-y-2 max-h-[400px] overflow-auto">
                {(searchQuery.data?.top_queries ?? []).map((q: { query: string; count: number; avg_results: number }, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-[13px] text-slate-700 truncate max-w-[250px]">{q.query}</span>
                    <div className="flex items-center gap-3 text-[12px]">
                      <span className="text-slate-500">{q.avg_results} avg results</span>
                      <span className="font-semibold text-slate-900">{q.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Zero-Result Queries</h3>
              <div className="space-y-2 max-h-[400px] overflow-auto">
                {(searchQuery.data?.zero_result_queries ?? []).length === 0 ? (
                  <p className="text-sm text-slate-400">No zero-result queries</p>
                ) : (
                  (searchQuery.data?.zero_result_queries ?? []).map((q: { query: string; count: number }, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                      <span className="text-[13px] text-red-600 truncate max-w-[250px]">{q.query}</span>
                      <span className="text-[12px] font-semibold text-slate-900">{q.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* CLICKS TAB */}
        <TabsContent value="clicks" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard label="Total Clicks" value={clickQuery.data?.stats?.total ?? 0} loading={clickQuery.isLoading} />
            <KPICard label="Unique Visitors" value={clickQuery.data?.stats?.unique_visitors ?? 0} loading={clickQuery.isLoading} />
            <KPICard label="Schools Clicked" value={clickQuery.data?.stats?.unique_schools ?? 0} loading={clickQuery.isLoading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              title="Clicks by Type"
              loading={clickQuery.isLoading}
              periods={PERIODS}
              defaultPeriod={clickDays}
              onPeriodChange={setClickDays}
            >
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={clickQuery.data?.by_type ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                  <YAxis dataKey="click_type" type="category" width={80} tick={{ fontSize: 11, fill: "#64748B" }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {(clickQuery.data?.by_type ?? []).map((entry: { click_type: string }) => (
                      <Bar
                        key={entry.click_type}
                        dataKey="count"
                        fill={CLICK_COLORS[entry.click_type] || "#94A3B8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Daily Click Trend" loading={clickQuery.isLoading}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={clickQuery.data?.daily_trend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="#FF6B35" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Top 10 Schools by Clicks</h3>
            <div className="space-y-2">
              {(clickQuery.data?.by_school ?? []).map((s: { name: string; count: number }, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-[13px] text-slate-700 truncate max-w-[300px]">{s.name}</span>
                  <span className="text-[13px] font-semibold text-slate-900">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* FUNNEL TAB */}
        <TabsContent value="funnel" className="mt-4 space-y-4">
          <ChartCard
            title="Conversion Funnel"
            loading={funnelQuery.isLoading}
            periods={PERIODS}
            defaultPeriod={funnelDays}
            onPeriodChange={setFunnelDays}
          >
            <div className="space-y-3 py-4">
              {(funnelQuery.data?.funnel ?? []).map((stage: { stage: string; count: number }, i: number) => {
                const maxCount = funnelQuery.data?.funnel?.[0]?.count || 1;
                const pct = Math.round((stage.count / maxCount) * 100);
                return (
                  <div key={stage.stage} className="flex items-center gap-4">
                    <span className="w-28 text-[13px] font-medium text-slate-700 text-right">{stage.stage}</span>
                    <div className="flex-1 h-8 bg-slate-50 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${Math.max(pct, 2)}%`,
                          backgroundColor: `hsl(${20 + i * 15}, 80%, ${55 + i * 5}%)`,
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-slate-700">
                        {stage.count.toLocaleString()}
                      </span>
                    </div>
                    <span className="w-12 text-[12px] text-slate-400 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
