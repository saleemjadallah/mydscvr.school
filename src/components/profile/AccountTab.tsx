"use client";

import { UserProfile } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";

export default function AccountTab() {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <UserProfile
        appearance={{
          ...clerkAppearance,
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none border-0",
            navbar: "hidden",
            pageScrollBox: "p-0",
          },
        }}
      />
    </div>
  );
}
