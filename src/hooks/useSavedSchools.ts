"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import type { School } from "@/types";
import { generateEventId, trackAddToWishlist, getFbp, getFbc } from "@/lib/meta-pixel";

interface SavedSchoolsResponse {
  schools: (School & { saved_at?: string; notes?: string })[];
}

export function useSavedSchools() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();

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

  const savedIds = new Set(
    query.data?.schools?.map((s) => s.id) ?? []
  );

  const saveMutation = useMutation({
    mutationFn: async (schoolId: string) => {
      // Meta Pixel: fire client-side AddToWishlist + generate dedup ID
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

  const toggleSave = (schoolId: string) => {
    if (savedIds.has(schoolId)) {
      unsaveMutation.mutate(schoolId);
    } else {
      saveMutation.mutate(schoolId);
    }
  };

  return {
    savedIds,
    savedSchools: query.data?.schools ?? [],
    isLoading: query.isLoading,
    toggleSave,
    isSaved: (id: string) => savedIds.has(id),
    isPending: saveMutation.isPending || unsaveMutation.isPending,
  };
}
