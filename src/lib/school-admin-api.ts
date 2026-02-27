import type {
  SchoolAdminDashboard,
  SchoolAdminEnquiry,
  SchoolAdminAnalytics,
  CreditStatus,
  SchoolSubscription,
} from "@/types";
import type { PlanConfig } from "@/lib/plans";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ??
        `Request failed with status ${res.status}`
    );
  }

  return res.json() as Promise<T>;
}

function qs(params?: Record<string, unknown>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      sp.set(key, String(value));
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// Dashboard
export async function getSchoolAdminDashboard() {
  return fetcher<SchoolAdminDashboard>("/api/school-admin/dashboard");
}

// Enquiries
export async function getSchoolAdminEnquiries(params?: Record<string, unknown>) {
  return fetcher<{
    enquiries: SchoolAdminEnquiry[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  }>(`/api/school-admin/enquiries${qs(params)}`);
}

export async function getSchoolAdminEnquiry(id: string) {
  return fetcher<{ enquiry: SchoolAdminEnquiry }>(
    `/api/school-admin/enquiries/${encodeURIComponent(id)}`
  );
}

export async function updateSchoolAdminEnquiry(id: string, data: { status: string }) {
  return fetcher<{ success: boolean; enquiry: SchoolAdminEnquiry }>(
    `/api/school-admin/enquiries/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify(data) }
  );
}

export async function disputeEnquiry(id: string, reason: string) {
  return fetcher<{ success: boolean; auto_credited: boolean; message: string }>(
    `/api/school-admin/enquiries/${encodeURIComponent(id)}/dispute`,
    { method: "POST", body: JSON.stringify({ reason }) }
  );
}

// Analytics
export async function getSchoolAdminAnalytics(period?: string) {
  return fetcher<SchoolAdminAnalytics>(
    `/api/school-admin/analytics${qs({ period })}`
  );
}

// Credits
export async function getSchoolAdminCredits() {
  return fetcher<CreditStatus & { overage_rate: number; plan_name: string }>(
    "/api/school-admin/credits"
  );
}

export async function getSchoolAdminCreditHistory() {
  return fetcher<{ periods: unknown[] }>("/api/school-admin/credits/history");
}

// Subscription
export async function getSchoolAdminSubscription() {
  return fetcher<{
    subscription: SchoolSubscription | null;
    current_plan: string;
    plans: (PlanConfig & { is_current: boolean })[];
  }>("/api/school-admin/subscription");
}

export async function cancelSubscription() {
  return fetcher<{ success: boolean; message: string; cancel_date: string }>(
    "/api/school-admin/subscription/cancel",
    { method: "POST" }
  );
}

export async function createCheckout(planId: string, billingCycle: string) {
  return fetcher<{ url?: string; error?: string; message?: string }>(
    "/api/school-admin/subscription/checkout",
    { method: "POST", body: JSON.stringify({ plan: planId, billing_cycle: billingCycle }) }
  );
}

export async function getSchoolAdminInvoices() {
  return fetcher<{ invoices: unknown[] }>("/api/school-admin/subscription/invoices");
}

// Profile
export async function getSchoolAdminProfile() {
  return fetcher<{ school: Record<string, unknown> }>("/api/school-admin/profile");
}

export async function updateSchoolAdminProfile(data: Record<string, unknown>) {
  return fetcher<{ success: boolean; school: Record<string, unknown> }>(
    "/api/school-admin/profile",
    { method: "PUT", body: JSON.stringify(data) }
  );
}

export async function deleteSchoolPhoto(id: string) {
  return fetcher<{ success: boolean }>(
    `/api/school-admin/profile/photos/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}
