import { getPlanConfig, type PlanId, type BadgeType } from "./plans";

export interface BadgeDefinition {
  type: BadgeType;
  label: string;
  icon: "check-circle" | "crown";
  className: string;
}

const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  verified: {
    type: "verified",
    label: "Claimed & Verified",
    icon: "check-circle",
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },
  premium: {
    type: "premium",
    label: "Premium School",
    icon: "crown",
    className: "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200",
  },
};

export function getSchoolBadges(plan: string): BadgeDefinition[] {
  const config = getPlanConfig(plan);
  return config.badges.map((b) => BADGE_DEFINITIONS[b]);
}

export function hasBadge(plan: string, type: BadgeType): boolean {
  const config = getPlanConfig(plan);
  return config.badges.includes(type);
}

export { type BadgeType };
