"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

export type SignUpWallFeature =
  | "save"
  | "compare"
  | "enquiry"
  | "chat"
  | "ai-search";

export function useSignUpWall() {
  const { isSignedIn } = useAuth();
  const [wallOpen, setWallOpen] = useState(false);
  const [wallFeature, setWallFeature] = useState<SignUpWallFeature>("save");

  const requireAuth = useCallback(
    (feature: SignUpWallFeature, callback: () => void) => {
      if (isSignedIn) {
        callback();
      } else {
        setWallFeature(feature);
        setWallOpen(true);
      }
    },
    [isSignedIn]
  );

  return {
    isSignedIn: !!isSignedIn,
    wallOpen,
    wallFeature,
    requireAuth,
    closeWall: () => setWallOpen(false),
  };
}
