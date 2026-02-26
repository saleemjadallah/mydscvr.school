"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface AdminClaim {
  id: string;
  school_name: string;
  school_slug: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminClaimsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-claims", statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/claims?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 1000 * 30,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Claim updated");
      queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
    },
    onError: () => toast.error("Failed to update claim"),
  });

  const columns: ColumnDef<AdminClaim, unknown>[] = [
    {
      accessorKey: "school_name",
      header: "School",
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">{row.original.school_name}</span>
      ),
    },
    {
      accessorKey: "contact_name",
      header: "Contact",
      cell: ({ row }) => (
        <div>
          <p className="text-[13px]">{row.original.contact_name}</p>
          <p className="text-[11px] text-slate-400">{row.original.contact_email}</p>
        </div>
      ),
    },
    { accessorKey: "role", header: "Role" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: "Submitted",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-500">
          {new Date(row.original.created_at).toLocaleDateString("en-GB")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        if (row.original.status !== "pending") return null;
        return (
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                updateMutation.mutate({ id: row.original.id, status: "approved" });
              }}
              disabled={updateMutation.isPending}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              <CheckCircle className="size-3.5 mr-1" /> Approve
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                updateMutation.mutate({ id: row.original.id, status: "rejected" });
              }}
              disabled={updateMutation.isPending}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="size-3.5 mr-1" /> Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Claims"
        description="School profile claim requests"
      />

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.claims ?? []}
        loading={isLoading}
        page={page}
        pageCount={data?.total_pages ?? 1}
        total={data?.total}
        onPageChange={setPage}
      />
    </div>
  );
}
