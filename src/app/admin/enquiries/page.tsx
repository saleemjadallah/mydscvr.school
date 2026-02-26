"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import KPICard from "@/components/admin/KPICard";
import { DataTable } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, MessageSquare, Clock, CheckCircle, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

interface AdminEnquiry {
  id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  child_grade: string;
  message: string;
  status: string;
  source: string;
  school_name: string;
  school_slug: string;
  created_at: string;
  days_waiting: number;
  admin_notes: string;
}

const STATUS_OPTIONS = ["new", "sent_to_school", "responded", "enrolled", "closed"];

const columns: ColumnDef<AdminEnquiry, unknown>[] = [
  {
    accessorKey: "parent_name",
    header: "Parent",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-slate-900">{row.original.parent_name}</p>
        <p className="text-[11px] text-slate-400">{row.original.parent_email}</p>
      </div>
    ),
  },
  {
    accessorKey: "school_name",
    header: "School",
    cell: ({ row }) => (
      <span className="text-[13px] text-slate-700 max-w-[200px] truncate block">
        {row.original.school_name}
      </span>
    ),
  },
  { accessorKey: "child_grade", header: "Grade" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <span className="text-[12px] text-slate-500">{row.original.source || "direct"}</span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-[12px] text-slate-500">
        {new Date(row.original.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
      </span>
    ),
  },
  {
    accessorKey: "days_waiting",
    header: "Days",
    cell: ({ row }) => (
      <span className={`text-[12px] font-medium ${row.original.days_waiting > 7 ? "text-red-500" : "text-slate-500"}`}>
        {row.original.days_waiting}d
      </span>
    ),
  },
];

export default function AdminEnquiriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<AdminEnquiry | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-enquiries", search, status, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/enquiries?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 30,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-enquiries"] });
      setSelected(null);
    },
    onError: () => toast.error("Failed to update"),
  });

  // Compute KPIs from data
  const enquiries = data?.enquiries ?? [];
  const pending = enquiries.filter((e: AdminEnquiry) => e.status === "new" || e.status === "sent_to_school").length;
  const responded = enquiries.filter((e: AdminEnquiry) => e.status === "responded" || e.status === "enrolled").length;
  const responseRate = data?.total ? Math.round((responded / Math.min(data.total, enquiries.length)) * 100) : 0;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Enquiries"
        description="Manage parent enquiries and leads"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total" value={data?.total ?? 0} loading={isLoading} icon={<MessageSquare className="size-4" />} />
        <KPICard label="This Page Pending" value={pending} loading={isLoading} icon={<Clock className="size-4" />} />
        <KPICard label="This Page Responded" value={responded} loading={isLoading} icon={<CheckCircle className="size-4" />} />
        <KPICard label="Response Rate" value={`${responseRate}%`} loading={isLoading} icon={<TrendingUp className="size-4" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, school..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={enquiries}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        pageCount={data?.total_pages ?? 1}
        total={data?.total}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onRowClick={(row) => { setSelected(row); setNewStatus(row.status); }}
      />

      {/* Enquiry detail sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Enquiry Details</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Parent</span>
                  <span className="font-medium">{selected.parent_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span>{selected.parent_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone</span>
                  <span>{selected.parent_phone || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">School</span>
                  <span className="font-medium">{selected.school_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grade</span>
                  <span>{selected.child_grade || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source</span>
                  <span>{selected.source || "direct"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Days Waiting</span>
                  <span className={selected.days_waiting > 7 ? "text-red-500 font-medium" : ""}>
                    {selected.days_waiting}d
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Created</span>
                  <span>{new Date(selected.created_at).toLocaleDateString("en-GB")}</span>
                </div>
              </div>

              {selected.message && (
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Message</p>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{selected.message}</p>
                </div>
              )}

              {/* Status update */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-900 mb-2">Update Status</p>
                <div className="flex gap-2">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={newStatus === selected.status || updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: selected.id, status: newStatus })}
                  >
                    {updateMutation.isPending ? "Saving..." : "Update"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
