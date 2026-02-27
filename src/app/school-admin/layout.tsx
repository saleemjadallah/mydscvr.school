"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import SchoolAdminSidebar, { SchoolAdminSidebarProvider } from "@/components/school-admin/SchoolAdminSidebar";
import SchoolAdminTopbar from "@/components/school-admin/SchoolAdminTopbar";
import { getSchoolAdminSubscription, getSchoolAdminProfile } from "@/lib/school-admin-api";
import { SchoolAdminContext } from "@/components/school-admin/SchoolAdminContext";
import { getPlanConfig } from "@/lib/plans";

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["school-admin-profile"],
    queryFn: getSchoolAdminProfile,
    enabled: isLoaded && isSignedIn === true,
    retry: false,
  });

  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ["school-admin-subscription"],
    queryFn: getSchoolAdminSubscription,
    enabled: isLoaded && isSignedIn === true,
    retry: false,
  });

  const isLoading = !isLoaded || profileLoading || subLoading;
  const school = profileData?.school ?? null;
  const subscription = subData?.subscription ?? null;
  const currentPlan = subData?.current_plan ?? "free";
  const planConfig = getPlanConfig(currentPlan);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]" />
      </div>
    );
  }

  // If not a school admin, show access prompt
  if (!isLoading && !school) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6B35]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏫</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">School Dashboard Access</h1>
          <p className="text-sm text-slate-500 mb-6">
            You don&apos;t have access to any school dashboard yet. If you manage a school listed on mydscvr.ai,
            you can claim your profile to get started.
          </p>
          <a
            href="/schools"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#FF6B35]/90 transition-colors"
          >
            Find & Claim Your School
          </a>
        </div>
      </div>
    );
  }

  return (
    <SchoolAdminContext.Provider value={{ school, subscription, currentPlan, isLoading }}>
      <SchoolAdminSidebarProvider>
        <div className="flex h-screen bg-slate-50">
          <SchoolAdminSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <SchoolAdminTopbar
              schoolName={school?.name as string}
              planName={planConfig.name}
            />
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </SchoolAdminSidebarProvider>
    </SchoolAdminContext.Provider>
  );
}
