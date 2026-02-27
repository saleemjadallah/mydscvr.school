"use client";

export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { getSchoolAdminDashboard } from "@/lib/school-admin-api";
import KPICard from "@/components/admin/KPICard";
import ChartCard from "@/components/admin/ChartCard";
import StatusBadge from "@/components/admin/StatusBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CreditMeter from "@/components/school-admin/CreditMeter";
import { Eye, MessageSquare, TrendingUp, CreditCard } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

export default function SchoolAdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["school-admin-dashboard"],
    queryFn: getSchoolAdminDashboard,
    refetchInterval: 120_000, // 2 min
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your school's performance"
      />

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Profile Views (30d)"
          value={data?.profile_views_30d ?? 0}
          delta={data?.profile_views_delta}
          detail="vs previous 30d"
          loading={isLoading}
          icon={<Eye className="size-4" />}
        />
        <KPICard
          label="Enquiries (30d)"
          value={data?.enquiries_30d ?? 0}
          delta={data?.enquiries_delta}
          detail="vs previous 30d"
          loading={isLoading}
          icon={<MessageSquare className="size-4" />}
        />
        <KPICard
          label="Conversion Rate"
          value={
            data && data.profile_views_30d > 0
              ? `${((data.enquiries_30d / data.profile_views_30d) * 100).toFixed(1)}%`
              : "0%"
          }
          detail="views to enquiries"
          loading={isLoading}
          icon={<TrendingUp className="size-4" />}
        />
        <KPICard
          label="Credits Remaining"
          value={
            data?.credit_status
              ? data.credit_status.credits_included >= 9999
                ? "Unlimited"
                : data.credit_status.credits_remaining
              : 0
          }
          detail={data?.plan ? `${data.plan} plan` : ""}
          loading={isLoading}
          icon={<CreditCard className="size-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enquiry Trend Chart */}
        <div className="lg:col-span-2">
          <ChartCard title="Enquiry Trend (30 days)" loading={isLoading}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data?.enquiry_trend ?? []}>
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
                    new Date(String(v)).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })
                  }
                />
                <Bar dataKey="count" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Credit Meter */}
        <div>
          {data?.credit_status && (
            <CreditMeter
              creditsIncluded={data.credit_status.credits_included}
              creditsUsed={data.credit_status.credits_used}
              overageCount={data.credit_status.overage_count}
              overageTotal={data.credit_status.overage_total}
              plan={data.plan}
            />
          )}
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="text-sm font-semibold text-slate-900">Recent Enquiries</h3>
          <Link
            href="/school-admin/enquiries"
            className="text-[13px] font-medium text-[#FF6B35] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="p-5">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : !data?.recent_enquiries?.length ? (
            <p className="text-[13px] text-slate-500 text-center py-8">
              No enquiries yet. Enquiries from parents will appear here.
            </p>
          ) : (
            <div className="space-y-2">
              {data.recent_enquiries.map((e) => (
                <Link
                  key={e.id}
                  href="/school-admin/enquiries"
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-slate-900 truncate">
                      {e.parent_name}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {e.child_grade ? `Grade ${e.child_grade} • ` : ""}
                      {new Date(e.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
