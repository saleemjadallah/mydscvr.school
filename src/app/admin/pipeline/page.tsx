"use client";

import { useQuery } from "@tanstack/react-query";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import KPICard from "@/components/admin/KPICard";
import StatusBadge from "@/components/admin/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertTriangle, Database, Clock } from "lucide-react";

export default function AdminPipelinePage() {
  const healthQuery = useQuery({
    queryKey: ["admin-pipeline-health"],
    queryFn: async () => {
      const res = await fetch("/api/admin/pipeline/health");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });

  const dlqQuery = useQuery({
    queryKey: ["admin-pipeline-dlq"],
    queryFn: async () => {
      const res = await fetch("/api/admin/pipeline/dlq");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });

  const health = healthQuery.data;
  const dlq = dlqQuery.data;
  const loading = healthQuery.isLoading;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Pipeline Health" description="Data pipeline status and coverage" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Schools"
          value={health?.coverage?.raw?.total ?? 0}
          detail={`${health?.coverage?.raw?.active ?? 0} active`}
          loading={loading}
          icon={<Database className="size-4" />}
        />
        <KPICard
          label="DLQ Items"
          value={health?.dlq_unresolved ?? 0}
          loading={loading}
          icon={<AlertTriangle className="size-4" />}
        />
        <KPICard
          label="Jobs Tracked"
          value={health?.last_runs?.length ?? 0}
          loading={loading}
          icon={<Activity className="size-4" />}
        />
        <KPICard
          label="Last Run"
          value={
            health?.last_runs?.[0]?.started_at
              ? new Date(health.last_runs[0].started_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
              : "N/A"
          }
          loading={loading}
          icon={<Clock className="size-4" />}
        />
      </div>

      {/* Data coverage */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Data Coverage</h3>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(health?.coverage?.percentages ?? {}).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <span className="w-24 text-[13px] text-slate-600 capitalize">{key}</span>
                <Progress value={value as number} className="flex-1 h-2" />
                <span className="w-12 text-[13px] font-semibold text-slate-900 text-right">{value as number}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job status grid */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Job Status</h3>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
        ) : (health?.last_runs ?? []).length === 0 ? (
          <p className="text-sm text-slate-400">No pipeline runs found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(health?.last_runs ?? []).map((job: Record<string, unknown>) => (
              <div key={job.job_name as string} className="rounded-lg border border-slate-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-medium text-slate-900">
                    {(job.job_name as string).replace(/_/g, " ")}
                  </span>
                  <StatusBadge status={job.status as string} />
                </div>
                <div className="space-y-1 text-[12px] text-slate-500">
                  {job.started_at ? (
                    <p>Started: {new Date(job.started_at as string).toLocaleString("en-GB")}</p>
                  ) : null}
                  {job.duration_seconds != null ? (
                    <p>Duration: {Math.round(job.duration_seconds as number)}s</p>
                  ) : null}
                  {job.error_message ? (
                    <p className="text-red-500 truncate" title={job.error_message as string}>
                      Error: {job.error_message as string}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DLQ summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Dead Letter Queue ({dlq?.total_unresolved ?? 0} unresolved)
        </h3>
        {dlqQuery.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (dlq?.summary ?? []).length === 0 ? (
          <p className="text-sm text-slate-400">No unresolved DLQ items</p>
        ) : (
          <div className="space-y-2">
            {(dlq?.summary ?? []).map((s: Record<string, unknown>) => (
              <div key={s.job_name as string} className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-[13px] text-slate-700">{(s.job_name as string).replace(/_/g, " ")}</span>
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="text-slate-500">Max attempts: {s.max_attempts as number}</span>
                  <span className="font-semibold text-amber-600">{s.count as number} items</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Source confidence */}
      {(health?.confidence_distribution ?? []).length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Source Confidence Distribution</h3>
          <div className="space-y-2">
            {(health?.confidence_distribution ?? []).map((s: Record<string, unknown>) => (
              <div key={s.source as string} className="flex items-center gap-4">
                <span className="w-40 text-[13px] text-slate-600">{s.source as string}</span>
                <Progress value={parseFloat(s.avg_confidence as string) * 100} className="flex-1 h-2" />
                <span className="w-20 text-[13px] text-slate-900 text-right">
                  {s.avg_confidence as string} ({s.count as number})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
