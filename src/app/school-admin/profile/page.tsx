"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSchoolAdminProfile, updateSchoolAdminProfile, deleteSchoolPhoto } from "@/lib/school-admin-api";
import { useSchoolAdmin } from "@/components/school-admin/SchoolAdminContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import UpgradePrompt from "@/components/school-admin/UpgradePrompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Save, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { getPlanConfig } from "@/lib/plans";

export default function SchoolAdminProfilePage() {
  const queryClient = useQueryClient();
  const { currentPlan } = useSchoolAdmin();
  const planConfig = getPlanConfig(currentPlan);

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["school-admin-profile"],
    queryFn: getSchoolAdminProfile,
    refetchOnWindowFocus: false, // Prevent background refetch from clearing unsaved edits
  });

  const school = data?.school;
  const [changes, setChanges] = useState<Record<string, unknown>>({});
  const [lastResetAt, setLastResetAt] = useState(0);
  const hasChanges = Object.keys(changes).length > 0;

  // Reset changes only on initial load or after explicit save (not background refetch)
  useEffect(() => {
    if (dataUpdatedAt > 0 && lastResetAt === 0) {
      setLastResetAt(dataUpdatedAt);
    }
  }, [dataUpdatedAt, lastResetAt]);

  const saveMutation = useMutation({
    mutationFn: () => updateSchoolAdminProfile(changes),
    onSuccess: () => {
      setChanges({});
      setLastResetAt(Date.now());
      queryClient.invalidateQueries({ queryKey: ["school-admin-profile"] });
      toast.success("Profile updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (id: string) => deleteSchoolPhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-admin-profile"] });
      toast.success("Photo deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function getField(field: string): unknown {
    return changes[field] !== undefined ? changes[field] : school?.[field];
  }

  function updateField(field: string, value: unknown) {
    setChanges((prev) => {
      const next = { ...prev };
      // If value matches original, remove from changes
      if (value === school?.[field]) {
        delete next[field];
      } else {
        next[field] = value;
      }
      return next;
    });
  }

  const photos = (school?.photos as Array<{ id: string; r2_url: string; photo_type: string }>) ?? [];
  const photoCount = photos.length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="School Profile"
        description="Edit your school's public profile"
        actions={
          <div className="flex items-center gap-2">
            {school?.slug ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`/schools/${String(school.slug)}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5 mr-1" />
                  Preview
                </a>
              </Button>
            ) : null}
            <Button
              size="sm"
              disabled={!hasChanges || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
            >
              <Save className="size-3.5 mr-1" />
              Save Changes
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="photos">Photos ({photoCount}/{planConfig.maxPhotos >= 999 ? "\u221e" : planConfig.maxPhotos})</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase mb-1.5 block">
                  Description
                </label>
                <Textarea
                  value={(getField("description") as string) ?? ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="text-[13px] min-h-[120px]"
                  placeholder="Tell parents about your school..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 uppercase mb-1.5 block">
                    Phone
                  </label>
                  <Input
                    value={(getField("phone") as string) ?? ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 uppercase mb-1.5 block">
                    Email
                  </label>
                  <Input
                    value={(getField("email") as string) ?? ""}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 uppercase mb-1.5 block">
                    Admission Email
                  </label>
                  <Input
                    value={(getField("admission_email") as string) ?? ""}
                    onChange={(e) => updateField("admission_email", e.target.value)}
                    className="text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 uppercase mb-1.5 block">
                    Website
                  </label>
                  <Input
                    value={(getField("website") as string) ?? ""}
                    onChange={(e) => updateField("website", e.target.value)}
                    className="text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 uppercase mb-1.5 block">
                    WhatsApp
                  </label>
                  <Input
                    value={(getField("whatsapp") as string) ?? ""}
                    onChange={(e) => updateField("whatsapp", e.target.value)}
                    className="text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 uppercase mb-1.5 block">
                    Address
                  </label>
                  <Input
                    value={(getField("address") as string) ?? ""}
                    onChange={(e) => updateField("address", e.target.value)}
                    className="text-[13px]"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] text-slate-500">
                  {photoCount} of {planConfig.maxPhotos >= 999 ? "unlimited" : planConfig.maxPhotos} photos used
                </p>
              </div>

              {photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-slate-200">
                      <Image
                        src={photo.r2_url}
                        alt=""
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-1 left-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white">
                          {photo.photo_type}
                        </span>
                      </div>
                      <button
                        onClick={() => deletePhotoMutation.mutate(photo.id)}
                        disabled={deletePhotoMutation.isPending}
                        className="absolute top-1 right-1 p-1 rounded bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-slate-500 text-center py-8">
                  No photos uploaded yet. Photo upload is coming soon.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              {[
                { key: "has_sen_support", label: "SEN Support" },
                { key: "has_transport", label: "Transport Available" },
                { key: "has_boarding", label: "Boarding Facilities" },
                { key: "has_after_school", label: "After-School Programs" },
                { key: "has_sports_facilities", label: "Sports Facilities" },
                { key: "has_swimming_pool", label: "Swimming Pool" },
                { key: "has_arts_program", label: "Arts Program" },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between">
                  <span className="text-[13px] text-slate-700">{feature.label}</span>
                  <Switch
                    checked={!!getField(feature.key)}
                    onCheckedChange={(checked) => updateField(feature.key, checked)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
