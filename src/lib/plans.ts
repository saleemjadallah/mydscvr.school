// ============================================
// Subscription Plan Configuration
// All prices in AED (integer)
// ============================================

export type PlanId = "free" | "starter" | "growth" | "elite" | "enterprise";

export type BadgeType = "verified" | "premium";

export interface PlanConfig {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  credits: number;
  overageRate: number;
  maxPhotos: number;
  featuredDaysPerWeek: number;
  searchBoost: number;
  badges: BadgeType[];
  videoAllowed: boolean;
  description: string;
}

export const PLAN_CONFIG: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    credits: 0,
    overageRate: 150,
    maxPhotos: 3,
    featuredDaysPerWeek: 0,
    searchBoost: 0,
    badges: [],
    videoAllowed: false,
    description: "Basic listing with pay-per-enquiry",
  },
  starter: {
    id: "starter",
    name: "Starter",
    monthlyPrice: 1500,
    annualPrice: 1200,
    credits: 10,
    overageRate: 125,
    maxPhotos: 10,
    featuredDaysPerWeek: 0,
    searchBoost: 0,
    badges: ["verified"],
    videoAllowed: false,
    description: "For schools starting their online presence",
  },
  growth: {
    id: "growth",
    name: "Growth",
    monthlyPrice: 4500,
    annualPrice: 3600,
    credits: 30,
    overageRate: 100,
    maxPhotos: 25,
    featuredDaysPerWeek: 1,
    searchBoost: 0.05,
    badges: ["verified"],
    videoAllowed: true,
    description: "Grow your school's visibility and enquiries",
  },
  elite: {
    id: "elite",
    name: "Elite",
    monthlyPrice: 9000,
    annualPrice: 7200,
    credits: 75,
    overageRate: 75,
    maxPhotos: 999,
    featuredDaysPerWeek: 3,
    searchBoost: 0.10,
    badges: ["verified", "premium"],
    videoAllowed: true,
    description: "Premium placement and maximum enquiry volume",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 15000,
    annualPrice: 12000,
    credits: 9999,
    overageRate: 0,
    maxPhotos: 999,
    featuredDaysPerWeek: 7,
    searchBoost: 0.15,
    badges: ["verified", "premium"],
    videoAllowed: true,
    description: "Unlimited enquiries with dedicated support",
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "starter", "growth", "elite", "enterprise"];

export const UNLIMITED_CREDITS = 9999;
export const MAX_AUTO_DISPUTE_CREDITS = 3;
export const DUPLICATE_WINDOW_DAYS = 30;

export function getPlanConfig(plan: string): PlanConfig {
  return PLAN_CONFIG[plan as PlanId] ?? PLAN_CONFIG.free;
}

export function isUnlimited(credits: number): boolean {
  return credits >= UNLIMITED_CREDITS;
}
