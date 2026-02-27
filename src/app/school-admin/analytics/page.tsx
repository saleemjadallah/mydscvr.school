"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSchoolAdminAnalytics } from "@/lib/school-admin-api";
import { useSchoolAdmin } from "@/components/school-admin/SchoolAdminContext";
import KPICard from "@/components/admin/KPICard";
import ChartCard from "@/components/admin/ChartCard";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import UpgradePrompt from "@/components/school-admin/UpgradePrompt";
import { Eye, MessageSquare, MousePointerClick, Users } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PERIODS = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
];

export default function SchoolAdminAnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const { currentPlan, isLoading: contextLoading } = useSchoolAdmin();

  const { data, isLoading } = useQuery({
    queryKey: ["school-admin-analytics", period],
    queryFn: () => getSchoolAdminAnalytics(period),
  });

  const totalViews = data?.profile_views?.reduce((s, r) => s + r.count, 0) ?? 0;
  const totalClicks = data?.clicks_by_type?.reduce((s, r) => s + r.count, 0) ?? 0;
  const isGrowthPlus = contextLoading || ["growth", "elite", "enterprise"].includes(currentPlan);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Track your school's visibility and engagement"
        actions={
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  period === p.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Profile Views"
          value={totalViews}
          delta={data?.previous_period.views_delta}
          detail="vs previous period"
          loading={isLoading}
          icon={<Eye className="size-4" />}
        />
        <KPICard
          label="Enquiries"
          value={data?.enquiry_funnel.enquiries ?? 0}
          delta={data?.previous_period.enquiries_delta}
          detail="vs previous period"
          loading={isLoading}
          icon={<MessageSquare className="size-4" />}
        />
        <KPICard
          label="Total Clicks"
          value={totalClicks}
          loading={isLoading}
          icon={<MousePointerClick className="size-4" />}
        />
        <KPICard
          label="Enrolled"
          value={data?.enquiry_funnel.enrolled ?? 0}
          loading={isLoading}
          icon={<Users className="size-4" />}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enquiries">Enquiry Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Profile Views Chart */}
            <ChartCard title="Profile Views" loading={isLoading}>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data?.profile_views ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(v) =>
                      new Date(String(v)).toLocaleDateString("en-US", { month: "long", day: "numeric" })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#FF6B35"
                    fill="#FF6B35"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Clicks by Type */}
            <ChartCard title="Clicks by Type" loading={isLoading}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data?.clicks_by_type ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="click_type"
                    tick={{ fontSize: 11 }}
                    width={80}
                    tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="enquiries" className="space-y-6">
          {!isGrowthPlus ? (
            <UpgradePrompt variant="overlay" feature="Enquiry Funnel">
              <div className="h-[300px] bg-slate-50 rounded-xl" />
            </UpgradePrompt>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Funnel */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Conversion Funnel</h3>
                <div className="space-y-3">
                  {[
                    { label: "Profile Views", value: data?.enquiry_funnel.views ?? 0, color: "bg-blue-500" },
                    { label: "Enquiries", value: data?.enquiry_funnel.enquiries ?? 0, color: "bg-[#FF6B35]" },
                    { label: "Responded", value: data?.enquiry_funnel.responded ?? 0, color: "bg-amber-500" },
                    { label: "Enrolled", value: data?.enquiry_funnel.enrolled ?? 0, color: "bg-emerald-500" },
                  ].map((step) => {
                    const max = data?.enquiry_funnel.views || 1;
                    const pct = (step.value / max) * 100;
                    return (
                      <div key={step.label}>
                        <div className="flex justify-between text-[13px] mb-1">
                          <span className="text-slate-600">{step.label}</span>
                          <span className="font-medium text-slate-900">{step.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className={`h-2 rounded-full ${step.color}`}
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Queries */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Top Search Queries</h3>
                {data?.top_queries?.length ? (
                  <div className="space-y-2">
                    {data.top_queries.map((q, i) => (
                      <div key={i} className="flex items-center justify-between text-[13px]">
                        <span className="text-slate-600 truncate mr-2">{q.query}</span>
                        <span className="font-medium text-slate-900 flex-shrink-0">{q.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-slate-500 text-center py-6">
                    No search queries found for this period.
                  </p>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
