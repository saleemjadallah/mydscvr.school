"use client";

import { createContext, useContext } from "react";
import type { SchoolSubscription } from "@/types";

export interface SchoolAdminContextValue {
  school: Record<string, unknown> | null;
  subscription: SchoolSubscription | null;
  currentPlan: string;
  isLoading: boolean;
}

// Default isLoading to true to prevent flash of "upgrade needed" before data loads
export const SchoolAdminContext = createContext<SchoolAdminContextValue>({
  school: null,
  subscription: null,
  currentPlan: "free",
  isLoading: true,
});

/**
 * Use this to check if features are available.
 * Returns false during loading to prevent premature UpgradePrompt flash.
 */
export function useIsFeatureGated(minPlans: string[]): boolean {
  const { currentPlan, isLoading } = useSchoolAdmin();
  if (isLoading) return false; // Don't gate while loading
  return !minPlans.includes(currentPlan);
}

export function useSchoolAdmin() {
  return useContext(SchoolAdminContext);
}
