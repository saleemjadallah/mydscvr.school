"use client";

import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
  variant: "overlay" | "banner";
  feature: string;
  requiredPlan?: string;
  children?: React.ReactNode;
}

export default function UpgradePrompt({
  variant,
  feature,
  requiredPlan = "Growth",
  children,
}: UpgradePromptProps) {
  if (variant === "overlay") {
    return (
      <div className="relative">
        {children && (
          <div className="blur-sm pointer-events-none select-none">{children}</div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
          <div className="text-center space-y-3 max-w-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Lock className="size-5 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Upgrade to unlock {feature}
            </h3>
            <p className="text-[13px] text-slate-500">
              {feature} is available on {requiredPlan}+ plans. Upgrade to get deeper insights into your school&apos;s performance.
            </p>
            <Link href="/school-admin/billing">
              <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">
                View Plans
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Banner variant
  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Lock className="size-4 text-amber-600 flex-shrink-0" />
        <p className="text-[13px] text-amber-800">
          <span className="font-semibold">{feature}</span> is available on {requiredPlan}+ plans.
        </p>
      </div>
      <Link href="/school-admin/billing">
        <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100 flex-shrink-0">
          Upgrade
        </Button>
      </Link>
    </div>
  );
}
