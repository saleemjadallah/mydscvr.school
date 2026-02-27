"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSchoolAdminSubscription,
  getSchoolAdminInvoices,
  cancelSubscription,
  createCheckout,
} from "@/lib/school-admin-api";
import { getSchoolAdminCredits } from "@/lib/school-admin-api";
import { useSchoolAdmin } from "@/components/school-admin/SchoolAdminContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PlanCard from "@/components/school-admin/PlanCard";
import PlanComparison from "@/components/school-admin/PlanComparison";
import CreditMeter from "@/components/school-admin/CreditMeter";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";
import { getPlanConfig, type PlanId } from "@/lib/plans";

export default function SchoolAdminBillingPage() {
  const queryClient = useQueryClient();
  const { currentPlan } = useSchoolAdmin();
  const [showComparison, setShowComparison] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ["school-admin-subscription"],
    queryFn: getSchoolAdminSubscription,
  });

  const { data: creditData, isLoading: creditLoading } = useQuery({
    queryKey: ["school-admin-credits"],
    queryFn: getSchoolAdminCredits,
  });

  const { data: invoiceData } = useQuery({
    queryKey: ["school-admin-invoices"],
    queryFn: getSchoolAdminInvoices,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["school-admin-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["school-admin-credits"] });
      toast.success(data.message);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const checkoutMutation = useMutation({
    mutationFn: ({ planId }: { planId: PlanId }) => createCheckout(planId, billingCycle),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.message || data.error || "Checkout not available");
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const planConfig = getPlanConfig(currentPlan);
  const subscription = subData?.subscription;
  const isLoading = subLoading || creditLoading;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Billing & Plans"
        description="Manage your subscription and billing"
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Current Plan + Credits */}
          <div className="grid gap-6 lg:grid-cols-2">
            <PlanCard
              plan={planConfig}
              billingCycle={subscription?.billing_cycle ?? "monthly"}
              cancelAtPeriodEnd={subscription?.cancel_at_period_end}
              periodEnd={subscription?.current_period_end}
              onChangePlan={() => setShowComparison(!showComparison)}
            />
            {creditData && (
              <CreditMeter
                creditsIncluded={creditData.credits_included}
                creditsUsed={creditData.credits_used}
                overageCount={creditData.overage_count}
                overageTotal={creditData.overage_total}
                plan={currentPlan}
                expanded
              />
            )}
          </div>

          {/* Plan Comparison Toggle */}
          <div>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center gap-1 text-[13px] font-medium text-[#FF6B35] hover:underline"
            >
              {showComparison ? (
                <>Hide plan comparison <ChevronUp className="size-3.5" /></>
              ) : (
                <>Compare all plans <ChevronDown className="size-3.5" /></>
              )}
            </button>
          </div>

          {showComparison && (
            <div className="space-y-3">
              {/* Billing Cycle Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-slate-500">Billing:</span>
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`rounded-md px-3 py-1 text-[12px] font-semibold transition-colors ${
                      billingCycle === "monthly"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("annual")}
                    className={`rounded-md px-3 py-1 text-[12px] font-semibold transition-colors ${
                      billingCycle === "annual"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Annual (save 20%)
                  </button>
                </div>
              </div>

              <PlanComparison
                currentPlan={currentPlan}
                billingCycle={billingCycle}
                onSelectPlan={(planId) => checkoutMutation.mutate({ planId })}
              />
            </div>
          )}

          {/* Billing History */}
          {invoiceData?.invoices && invoiceData.invoices.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="p-5 pb-0">
                <h3 className="text-sm font-semibold text-slate-900">Billing History</h3>
              </div>
              <div className="p-5 overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left pb-2 font-semibold text-slate-500">Period</th>
                      <th className="text-left pb-2 font-semibold text-slate-500">Plan</th>
                      <th className="text-right pb-2 font-semibold text-slate-500">Subscription</th>
                      <th className="text-right pb-2 font-semibold text-slate-500">Overage</th>
                      <th className="text-right pb-2 font-semibold text-slate-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoiceData.invoices as Array<{
                      id: string;
                      period_start: string;
                      period_end: string;
                      plan: string;
                      subscription_fee: number;
                      overage_charges: number;
                      total: number;
                    }>).map((inv) => (
                      <tr key={inv.id} className="border-b border-slate-50">
                        <td className="py-2.5 text-slate-700">
                          {new Date(inv.period_start).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </td>
                        <td className="py-2.5 text-slate-600 capitalize">{inv.plan}</td>
                        <td className="py-2.5 text-right text-slate-700">
                          AED {(inv.subscription_fee ?? 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right text-slate-700">
                          AED {(inv.overage_charges ?? 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-medium text-slate-900">
                          AED {(inv.total ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cancel Subscription */}
          {subscription && subscription.plan !== "free" && !subscription.cancel_at_period_end && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Cancel Subscription</h3>
              <p className="text-[13px] text-slate-500 mb-4">
                Your plan will remain active until the end of the current billing period.
                You can resubscribe at any time.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={cancelMutation.isPending}
                onClick={() => {
                  if (confirm("Are you sure you want to cancel your subscription?")) {
                    cancelMutation.mutate();
                  }
                }}
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
