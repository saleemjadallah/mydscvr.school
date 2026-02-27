"use client";

import type { PlanConfig } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown } from "lucide-react";

interface PlanCardProps {
  plan: PlanConfig;
  billingCycle?: "monthly" | "annual";
  cancelAtPeriodEnd?: boolean;
  periodEnd?: string | null;
  onChangePlan?: () => void;
}

export default function PlanCard({
  plan,
  billingCycle = "monthly",
  cancelAtPeriodEnd,
  periodEnd,
  onChangePlan,
}: PlanCardProps) {
  const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900">{plan.name} Plan</h3>
          {plan.badges.includes("verified") && (
            <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200 text-[10px]">
              <CheckCircle className="size-3 mr-0.5" />
              Verified
            </Badge>
          )}
          {plan.badges.includes("premium") && (
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200 text-[10px]"
            >
              <Crown className="size-3 mr-0.5" />
              Premium
            </Badge>
          )}
        </div>
        {onChangePlan && (
          <Button variant="outline" size="sm" onClick={onChangePlan}>
            Change Plan
          </Button>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        {price > 0 ? (
          <>
            <span className="text-3xl font-bold text-slate-900">AED {price.toLocaleString()}</span>
            <span className="text-sm text-slate-500">/{billingCycle === "annual" ? "mo (billed annually)" : "month"}</span>
          </>
        ) : (
          <span className="text-3xl font-bold text-slate-900">Free</span>
        )}
      </div>

      {cancelAtPeriodEnd && periodEnd && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[13px] text-amber-700 mb-4">
          Plan cancels on {new Date(periodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>
      )}

      <div className="space-y-2 text-[13px] text-slate-600">
        <p>{plan.credits >= 9999 ? "Unlimited" : plan.credits} enquiry credits/month</p>
        {plan.overageRate > 0 && <p>AED {plan.overageRate}/enquiry after credits</p>}
        <p>Up to {plan.maxPhotos >= 999 ? "unlimited" : plan.maxPhotos} photos</p>
        {plan.featuredDaysPerWeek > 0 && (
          <p>Featured {plan.featuredDaysPerWeek >= 7 ? "every day" : `${plan.featuredDaysPerWeek} day${plan.featuredDaysPerWeek > 1 ? "s" : ""}/week`}</p>
        )}
        {plan.searchBoost > 0 && <p>+{(plan.searchBoost * 100).toFixed(0)}% search boost</p>}
        {plan.videoAllowed && <p>Video tour support</p>}
      </div>
    </div>
  );
}
