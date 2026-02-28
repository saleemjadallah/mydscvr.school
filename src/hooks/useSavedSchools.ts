"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import type { School } from "@/types";
import { generateEventId, trackAddToWishlist, getFbp, getFbc } from "@/lib/meta-pixel";
import { useLocalSavedSchools, type LocalSavedSchool } from "./useLocalSavedSchools";

interface SavedSchoolsResponse {
  schools: (School & { saved_at?: string; notes?: string })[];
}

export type SchoolCardData = LocalSavedSchool;

export function useSavedSchools() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const syncedRef = useRef(false);

  const {
    localSavedSchools,
    localSavedIds,
    addLocalSave,
    removeLocalSave,
    isLocalSaved,
    isAtLimit,
    localSaveCount,
    clearLocalSaves,
    hydrated,
  } = useLocalSavedSchools();

  // Server-side query (only when signed in)
  const query = useQuery<SavedSchoolsResponse>({
    queryKey: ["saved-schools"],
    queryFn: async () => {
      const res = await fetch("/api/saved-schools");
      if (!res.ok) throw new Error("Failed to fetch saved schools");
      return res.json();
    },
    enabled: !!isSignedIn,
    staleTime: 1000 * 60 * 5,
  });

  const serverIds = new Set(
    query.data?.schools?.map((s) => s.id) ?? []
  );

  // Sync localStorage → server on sign-in
  useEffect(() => {
    if (!isSignedIn || !hydrated || localSaveCount === 0 || syncedRef.current) return;
    syncedRef.current = true;

    const ids = Array.from(localSavedIds);
    fetch("/api/saved-schools/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolIds: ids }),
    })
      .then((res) => {
        if (res.ok) {
          clearLocalSaves();
          queryClient.invalidateQueries({ queryKey: ["saved-schools"] });
        }
      })
      .catch(() => {
        // Sync failed — keep local saves, will retry next session
        syncedRef.current = false;
      });
  }, [isSignedIn, hydrated, localSaveCount, localSavedIds, clearLocalSaves, queryClient]);

  // Server mutations
  const saveMutation = useMutation({
    mutationFn: async (schoolId: string) => {
      const metaEventId = generateEventId();
      const metaFbp = getFbp();
      const metaFbc = getFbc();
      trackAddToWishlist({ content_ids: [schoolId], eventId: metaEventId });

      const res = await fetch("/api/saved-schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          meta_event_id: metaEventId,
          meta_fbp: metaFbp,
          meta_fbc: metaFbc,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-schools"] });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async (schoolId: string) => {
      const res = await fetch(`/api/saved-schools/${schoolId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to unsave");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-schools"] });
    },
  });

  // Unified toggle
  const toggleSave = (schoolId: string, schoolData?: SchoolCardData) => {
    if (isSignedIn) {
      // Server-side toggle
      if (serverIds.has(schoolId)) {
        unsaveMutation.mutate(schoolId);
      } else {
        saveMutation.mutate(schoolId);
      }
    } else {
      // localStorage toggle
      if (isLocalSaved(schoolId)) {
        removeLocalSave(schoolId);
      } else if (schoolData) {
        addLocalSave(schoolData);
      }
    }
  };

  // Unified isSaved
  const isSaved = (id: string): boolean => {
    if (isSignedIn) return serverIds.has(id);
    return isLocalSaved(id);
  };

  // Unified savedIds
  const savedIds = isSignedIn ? serverIds : localSavedIds;

  return {
    savedIds,
    savedSchools: isSignedIn ? (query.data?.schools ?? []) : localSavedSchools,
    isLoading: isSignedIn ? query.isLoading : !hydrated,
    toggleSave,
    isSaved,
    isPending: saveMutation.isPending || unsaveMutation.isPending,
    isAtLocalLimit: isAtLimit,
    localSaveCount,
    hydrated,
  };
}
