"use client";

import { isUnlimited } from "@/lib/plans";
import { Progress } from "@/components/ui/progress";

interface CreditMeterProps {
  creditsIncluded: number;
  creditsUsed: number;
  overageCount: number;
  overageTotal: number;
  plan: string;
  expanded?: boolean;
}

export default function CreditMeter({
  creditsIncluded,
  creditsUsed,
  overageCount,
  overageTotal,
  plan,
  expanded = false,
}: CreditMeterProps) {
  if (isUnlimited(creditsIncluded)) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-900">Enquiry Credits</h3>
          <span className="text-xs font-semibold text-emerald-600">Unlimited</span>
        </div>
        <p className="text-[13px] text-slate-500">
          Your {plan} plan includes unlimited enquiry credits.
        </p>
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-[13px] text-slate-500">
            <span className="font-medium text-slate-700">{creditsUsed}</span> enquiries received this period
          </div>
        )}
      </div>
    );
  }

  const remaining = Math.max(0, creditsIncluded - creditsUsed);
  const percentage = creditsIncluded > 0 ? (creditsUsed / creditsIncluded) * 100 : 0;

  let color = "text-emerald-600";
  let progressColor = "[&>div]:bg-emerald-500";
  if (percentage >= 80) {
    color = "text-red-600";
    progressColor = "[&>div]:bg-red-500";
  } else if (percentage >= 50) {
    color = "text-amber-600";
    progressColor = "[&>div]:bg-amber-500";
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900">Enquiry Credits</h3>
        <span className={`text-xs font-semibold ${color}`}>
          {remaining} remaining
        </span>
      </div>

      <Progress value={percentage} className={`h-2 mb-2 ${progressColor}`} />

      <p className="text-[13px] text-slate-500">
        {creditsUsed} of {creditsIncluded} credits used
      </p>

      {overageCount > 0 && (
        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[13px] text-amber-700">
          {overageCount} overage {overageCount === 1 ? "enquiry" : "enquiries"} &middot; AED {overageTotal} charged
        </div>
      )}

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-500">Credits included</span>
            <span className="font-medium text-slate-700">{creditsIncluded}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-500">Credits used</span>
            <span className="font-medium text-slate-700">{creditsUsed}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-500">Overage charges</span>
            <span className="font-medium text-slate-700">AED {overageTotal}</span>
          </div>
        </div>
      )}
    </div>
  );
}
