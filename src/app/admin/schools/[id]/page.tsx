"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { use, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminSchoolEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [changes, setChanges] = useState<Record<string, unknown>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-school", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/schools/${id}`);
      if (!res.ok) throw new Error("Failed to fetch school");
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/schools/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      toast.success("School updated");
      queryClient.invalidateQueries({ queryKey: ["admin-school", id] });
      setChanges({});
    },
    onError: () => toast.error("Failed to update school"),
  });

  const school = data?.school;
  const getValue = (field: string) => changes[field] ?? school?.[field] ?? "";
  const getBool = (field: string) => changes[field] ?? school?.[field] ?? false;

  function updateField(field: string, value: unknown) {
    setChanges((prev) => ({ ...prev, [field]: value }));
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!school) {
    return <p className="text-slate-500">School not found</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/schools">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <AdminPageHeader
          title={school.name}
          description={`${school.area} &middot; ${school.type} &middot; ${school.slug}`}
          actions={
            <div className="flex items-center gap-2">
              <Link href={`/schools/${school.slug}`} target="_blank">
                <Button variant="outline" size="sm">
                  <ExternalLink className="size-3.5 mr-1.5" /> View
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => saveMutation.mutate()}
                disabled={Object.keys(changes).length === 0 || saveMutation.isPending}
              >
                <Save className="size-3.5 mr-1.5" />
                {saveMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          }
        />
      </div>

      {/* Quick status badges */}
      <div className="flex flex-wrap gap-2">
        {school.is_verified && <StatusBadge status="verified" />}
        {school.is_featured && <StatusBadge status="featured" />}
        {!school.is_active && <StatusBadge status="inactive" />}
        {school.khda_rating && <StatusBadge status={school.khda_rating.toLowerCase().replace(/ /g, "_")} />}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="ai">AI Content</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <div>
              <Label>Name</Label>
              <Input value={getValue("name")} onChange={(e) => updateField("name", e.target.value)} />
            </div>
            <div>
              <Label>Area</Label>
              <Input value={getValue("area")} onChange={(e) => updateField("area", e.target.value)} />
            </div>
            <div>
              <Label>KHDA Rating</Label>
              <Input value={getValue("khda_rating")} onChange={(e) => updateField("khda_rating", e.target.value)} />
            </div>
            <div>
              <Label>Type</Label>
              <Input value={getValue("type")} onChange={(e) => updateField("type", e.target.value)} />
            </div>
            <div>
              <Label>Gender</Label>
              <Input value={getValue("gender")} onChange={(e) => updateField("gender", e.target.value)} />
            </div>
            <div>
              <Label>Meta Description</Label>
              <Input value={getValue("meta_description")} onChange={(e) => updateField("meta_description", e.target.value)} />
            </div>
            <div>
              <Label>Fee Min (AED)</Label>
              <Input type="number" value={getValue("fee_min")} onChange={(e) => updateField("fee_min", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label>Fee Max (AED)</Label>
              <Input type="number" value={getValue("fee_max")} onChange={(e) => updateField("fee_max", e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <Label>Description</Label>
            <Textarea
              rows={4}
              value={getValue("description")}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <div>
              <Label>Website</Label>
              <Input value={getValue("website")} onChange={(e) => updateField("website", e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={getValue("email")} onChange={(e) => updateField("email", e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={getValue("phone")} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={getValue("address")} onChange={(e) => updateField("address", e.target.value)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-4 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div>
              <Label>AI Summary</Label>
              <Textarea
                rows={4}
                value={getValue("ai_summary")}
                onChange={(e) => updateField("ai_summary", e.target.value)}
              />
            </div>
            <div>
              <Label>AI Strengths (JSON array)</Label>
              <Textarea
                rows={3}
                value={typeof getValue("ai_strengths") === "string" ? getValue("ai_strengths") : JSON.stringify(getValue("ai_strengths") || [], null, 2)}
                onChange={(e) => {
                  try {
                    updateField("ai_strengths", JSON.parse(e.target.value));
                  } catch {
                    updateField("ai_strengths", e.target.value);
                  }
                }}
              />
            </div>
            <div>
              <Label>AI Considerations (JSON array)</Label>
              <Textarea
                rows={3}
                value={typeof getValue("ai_considerations") === "string" ? getValue("ai_considerations") : JSON.stringify(getValue("ai_considerations") || [], null, 2)}
                onChange={(e) => {
                  try {
                    updateField("ai_considerations", JSON.parse(e.target.value));
                  } catch {
                    updateField("ai_considerations", e.target.value);
                  }
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="status" className="mt-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            {[
              { field: "is_active", label: "Active" },
              { field: "is_verified", label: "Verified" },
              { field: "is_featured", label: "Featured" },
              { field: "has_sen_support", label: "SEN Support" },
              { field: "has_bus_service", label: "Bus Service" },
              { field: "has_boarding", label: "Boarding" },
              { field: "has_after_school", label: "After School Activities" },
              { field: "has_scholarships", label: "Scholarships" },
              { field: "has_gifted_program", label: "Gifted Program" },
              { field: "has_waiting_list", label: "Waiting List" },
            ].map(({ field, label }) => (
              <div key={field} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch
                  checked={getBool(field)}
                  onCheckedChange={(v) => updateField(field, v)}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="data" className="mt-4 space-y-4">
          {/* Click stats */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Click Stats (30d)</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Total Clicks:</span>{" "}
                <span className="font-medium">{data?.click_stats?.total_clicks ?? 0}</span>
              </div>
              <div>
                <span className="text-slate-500">Unique Visitors:</span>{" "}
                <span className="font-medium">{data?.click_stats?.unique_visitors ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Reviews summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Reviews Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Total:</span>{" "}
                <span className="font-medium">{data?.reviews_summary?.total ?? 0}</span>
              </div>
              <div>
                <span className="text-slate-500">Avg Rating:</span>{" "}
                <span className="font-medium">{data?.reviews_summary?.avg_rating ?? "N/A"}</span>
              </div>
              <div className="text-emerald-600">
                Positive: {data?.reviews_summary?.positive ?? 0}
              </div>
              <div className="text-slate-500">
                Neutral: {data?.reviews_summary?.neutral ?? 0}
              </div>
              <div className="text-red-500">
                Negative: {data?.reviews_summary?.negative ?? 0}
              </div>
            </div>
          </div>

          {/* Fee history */}
          {data?.fees?.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Fee History</h3>
              <div className="max-h-[300px] overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 text-[12px]">
                      <th className="pb-2">Grade</th>
                      <th className="pb-2">Year</th>
                      <th className="pb-2">Amount (AED)</th>
                      <th className="pb-2">Source</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {data.fees.map((f: Record<string, unknown>, i: number) => (
                      <tr key={i} className="border-t border-slate-50">
                        <td className="py-1.5">{f.grade as string}</td>
                        <td>{f.year as number}</td>
                        <td>{(f.fee_amount as number)?.toLocaleString()}</td>
                        <td><StatusBadge status={f.source as string} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
