"use client";

import { PLAN_ORDER, PLAN_CONFIG, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";

interface PlanComparisonProps {
  currentPlan: string;
  onSelectPlan?: (planId: PlanId) => void;
  billingCycle?: "monthly" | "annual";
}

export default function PlanComparison({
  currentPlan,
  onSelectPlan,
  billingCycle = "monthly",
}: PlanComparisonProps) {
  const features = [
    { label: "Monthly price", key: "price" },
    { label: "Enquiry credits", key: "credits" },
    { label: "Overage rate", key: "overage" },
    { label: "Photos", key: "photos" },
    { label: "Featured days/week", key: "featured" },
    { label: "Search boost", key: "boost" },
    { label: "Verified badge", key: "verified" },
    { label: "Premium badge", key: "premium" },
    { label: "Video tours", key: "video" },
  ];

  function getValue(planId: PlanId, key: string): React.ReactNode {
    const plan = PLAN_CONFIG[planId];
    const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

    switch (key) {
      case "price":
        return price > 0 ? `AED ${price.toLocaleString()}` : "Free";
      case "credits":
        return plan.credits >= 9999 ? "Unlimited" : plan.credits.toString();
      case "overage":
        return plan.overageRate > 0 ? `AED ${plan.overageRate}` : "N/A";
      case "photos":
        return plan.maxPhotos >= 999 ? "Unlimited" : plan.maxPhotos.toString();
      case "featured":
        return plan.featuredDaysPerWeek >= 7 ? "Every day" : plan.featuredDaysPerWeek.toString();
      case "boost":
        return plan.searchBoost > 0 ? `+${(plan.searchBoost * 100).toFixed(0)}%` : "None";
      case "verified":
        return plan.badges.includes("verified")
          ? <CheckCircle className="size-4 text-teal-600 mx-auto" />
          : <X className="size-4 text-slate-300 mx-auto" />;
      case "premium":
        return plan.badges.includes("premium")
          ? <CheckCircle className="size-4 text-amber-600 mx-auto" />
          : <X className="size-4 text-slate-300 mx-auto" />;
      case "video":
        return plan.videoAllowed
          ? <CheckCircle className="size-4 text-emerald-600 mx-auto" />
          : <X className="size-4 text-slate-300 mx-auto" />;
      default:
        return "";
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left p-4 font-semibold text-slate-500 w-[180px]">Feature</th>
            {PLAN_ORDER.map((id) => {
              const plan = PLAN_CONFIG[id];
              const isCurrent = id === currentPlan;
              return (
                <th
                  key={id}
                  className={`p-4 text-center ${isCurrent ? "bg-[#FF6B35]/5" : ""}`}
                >
                  <div className="font-bold text-slate-900">{plan.name}</div>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold text-[#FF6B35]">Current</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.key} className="border-b border-slate-50">
              <td className="p-4 font-medium text-slate-600">{feature.label}</td>
              {PLAN_ORDER.map((id) => {
                const isCurrent = id === currentPlan;
                return (
                  <td
                    key={id}
                    className={`p-4 text-center text-slate-700 ${isCurrent ? "bg-[#FF6B35]/5" : ""}`}
                  >
                    {getValue(id, feature.key)}
                  </td>
                );
              })}
            </tr>
          ))}
          {onSelectPlan && (
            <tr>
              <td className="p-4" />
              {PLAN_ORDER.map((id) => {
                const isCurrent = id === currentPlan;
                return (
                  <td key={id} className={`p-4 text-center ${isCurrent ? "bg-[#FF6B35]/5" : ""}`}>
                    {isCurrent ? (
                      <span className="text-[13px] font-medium text-slate-400">Current plan</span>
                    ) : (
                      <Button
                        size="sm"
                        variant={id === "elite" || id === "enterprise" ? "default" : "outline"}
                        className={id === "elite" || id === "enterprise" ? "bg-[#FF6B35] hover:bg-[#FF6B35]/90" : ""}
                        onClick={() => onSelectPlan(id)}
                      >
                        Select
                      </Button>
                    )}
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
