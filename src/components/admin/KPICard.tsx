import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface KPICardProps {
  label: string;
  value: string | number;
  detail?: string;
  delta?: number; // percentage change
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function KPICard({ label, value, detail, delta, loading, icon }: KPICardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-slate-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        {delta !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              delta > 0
                ? "text-emerald-600"
                : delta < 0
                  ? "text-red-500"
                  : "text-slate-400"
            }`}
          >
            {delta > 0 ? (
              <TrendingUp className="size-3" />
            ) : delta < 0 ? (
              <TrendingDown className="size-3" />
            ) : (
              <Minus className="size-3" />
            )}
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
        )}
        {detail && <span className="text-xs text-slate-400">{detail}</span>}
      </div>
    </div>
  );
}
