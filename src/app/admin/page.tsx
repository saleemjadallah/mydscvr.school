"use client";

import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Users,
  MessageSquare,
  Search,
  Eye,
  MousePointerClick,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import KPICard from "@/components/admin/KPICard";
import ChartCard from "@/components/admin/ChartCard";
import StatusBadge from "@/components/admin/StatusBadge";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  new: "#3B82F6",
  sent_to_school: "#F59E0B",
  responded: "#10B981",
  enrolled: "#8B5CF6",
  closed: "#94A3B8",
};

const SOURCE_COLORS = ["#FF6B35", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Platform overview and key metrics"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          label="Total Schools"
          value={data?.schools?.active ?? 0}
          detail={`${data?.schools?.verified_pct ?? 0}% verified, ${data?.schools?.fees_pct ?? 0}% with fees`}
          loading={isLoading}
          icon={<GraduationCap className="size-4" />}
        />
        <KPICard
          label="Total Users"
          value={data?.users?.total ?? 0}
          detail={`${data?.users?.new_this_week ?? 0} new this week`}
          loading={isLoading}
          icon={<Users className="size-4" />}
        />
        <KPICard
          label="Enquiries"
          value={data?.enquiries?.total ?? 0}
          detail={`${data?.enquiries?.this_week ?? 0} this week, ${data?.enquiries?.pending ?? 0} pending`}
          loading={isLoading}
          icon={<MessageSquare className="size-4" />}
        />
        <KPICard
          label="Searches"
          value={data?.searches_this_week ?? 0}
          detail="this week"
          loading={isLoading}
          icon={<Search className="size-4" />}
        />
        <KPICard
          label="Page Views"
          value={data?.page_views_this_week ?? 0}
          detail="this week"
          loading={isLoading}
          icon={<Eye className="size-4" />}
        />
        <KPICard
          label="Outbound Clicks"
          value={data?.clicks?.total ?? 0}
          detail="this week"
          loading={isLoading}
          icon={<MousePointerClick className="size-4" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Enquiries over time */}
        <ChartCard title="Enquiries Over Time (30d)" loading={isLoading}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data?.charts?.enquiries_timeline ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                tickFormatter={(v) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #E2E8F0" }}
                labelFormatter={(v) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <Area
                  key={status}
                  type="monotone"
                  dataKey={status}
                  stackId="1"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                  name={status.replace(/_/g, " ")}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top schools by enquiries */}
        <ChartCard title="Top 10 Schools by Enquiries" loading={isLoading}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data?.charts?.top_schools_by_enquiries ?? []}
              layout="vertical"
              margin={{ left: 10, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis
                dataKey="name"
                type="category"
                width={160}
                tick={{ fontSize: 11, fill: "#64748B" }}
                tickFormatter={(v: string) => v.length > 25 ? v.slice(0, 25) + "..." : v}
              />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #E2E8F0" }} />
              <Bar dataKey="count" fill="#FF6B35" radius={[0, 4, 4, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Second row: source breakdown + quick lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Source breakdown pie */}
        <ChartCard title="Enquiry Source Breakdown" loading={isLoading}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.charts?.enquiry_source_breakdown ?? []}
                dataKey="count"
                nameKey="source"
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
                {(data?.charts?.enquiry_source_breakdown ?? []).map((_: unknown, i: number) => (
                  <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent enquiries */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Recent Enquiries</h3>
            <Link href="/admin/enquiries" className="text-[12px] font-medium text-[#FF6B35] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-slate-50 animate-pulse" />
                ))
              : (data?.recent_enquiries ?? []).map((e: Record<string, unknown>) => (
                  <div key={e.id as string} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-slate-900 truncate">{e.parent_name as string}</p>
                      <p className="text-[11px] text-slate-500 truncate">{e.school_name as string}</p>
                    </div>
                    <StatusBadge status={e.status as string} />
                  </div>
                ))
            }
          </div>
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-slate-500">Pending Claims</span>
                <Link href="/admin/claims" className="text-[13px] font-semibold text-slate-900 hover:text-[#FF6B35]">
                  {data?.pending_claims ?? 0}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-slate-500">Response Rate</span>
                <span className="text-[13px] font-semibold text-slate-900">
                  {data?.enquiries?.total
                    ? `${Math.round(((data.enquiries.responded ?? 0) / data.enquiries.total) * 100)}%`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Pipeline health summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Pipeline Health</h3>
              <Link href="/admin/pipeline" className="text-[12px] font-medium text-[#FF6B35] hover:underline">
                Details
              </Link>
            </div>
            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-6 rounded bg-slate-50 animate-pulse" />
                ))
              ) : (data?.pipeline_health ?? []).length === 0 ? (
                <p className="text-[13px] text-slate-400">No pipeline data</p>
              ) : (
                (data?.pipeline_health ?? []).slice(0, 5).map((job: Record<string, unknown>) => (
                  <div key={job.job_name as string} className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-600 truncate max-w-[140px]">
                      {(job.job_name as string).replace(/_/g, " ")}
                    </span>
                    <StatusBadge status={job.status as string} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
