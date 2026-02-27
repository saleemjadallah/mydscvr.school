"use client";

import { CheckCircle, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BadgeType } from "@/lib/badges";

interface SchoolBadgeProps {
  type: BadgeType;
  size?: "sm" | "md";
}

export default function SchoolBadge({ type, size = "sm" }: SchoolBadgeProps) {
  if (type === "verified") {
    return (
      <Badge
        variant="secondary"
        className={`bg-teal-50 text-teal-700 border-teal-200 ${
          size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"
        }`}
      >
        <CheckCircle className={`${size === "sm" ? "size-3" : "size-3.5"} mr-0.5`} />
        Verified
      </Badge>
    );
  }

  if (type === "premium") {
    return (
      <Badge
        variant="secondary"
        className={`border-amber-200 ${
          size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"
        }`}
        style={{
          background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(255,107,53,0.1))",
          color: "#b45309",
        }}
      >
        <Crown className={`${size === "sm" ? "size-3" : "size-3.5"} mr-0.5`} />
        Premium
      </Badge>
    );
  }

  return null;
}
