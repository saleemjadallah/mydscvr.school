"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuditEntry {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string;
  target_id: string;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

const columns: ColumnDef<AuditEntry, unknown>[] = [
  {
    accessorKey: "admin_user_id",
    header: "Admin",
    cell: ({ row }) => (
      <span className="text-[12px] font-mono text-slate-600">
        {(row.original.admin_user_id ?? "").slice(0, 12)}...
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <StatusBadge status={row.original.action} />,
  },
  {
    accessorKey: "target_type",
    header: "Target",
    cell: ({ row }) => (
      <div className="text-[13px]">
        <span className="text-slate-500">{row.original.target_type}:</span>{" "}
        <span className="font-mono text-slate-700">{(row.original.target_id ?? "").slice(0, 8)}...</span>
      </div>
    ),
  },
  {
    accessorKey: "changes",
    header: "Changes",
    cell: ({ row }) => {
      if (!row.original.changes) return <span className="text-slate-400">-</span>;
      return (
        <details className="text-[11px]">
          <summary className="cursor-pointer text-[#FF6B35] hover:underline">View</summary>
          <pre className="mt-1 max-h-[200px] overflow-auto rounded bg-slate-50 p-2 text-[10px] text-slate-600">
            {JSON.stringify(row.original.changes, null, 2)}
          </pre>
        </details>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Time",
    cell: ({ row }) => (
      <span className="text-[12px] text-slate-500">
        {new Date(row.original.created_at).toLocaleString("en-GB", {
          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        })}
      </span>
    ),
  },
];

export default function AdminAuditPage() {
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit", action, targetType, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (action) params.set("action", action);
      if (targetType) params.set("target_type", targetType);
      const res = await fetch(`/api/admin/audit?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Audit Log"
        description="Admin action history (read-only)"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={action} onValueChange={(v) => { setAction(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="update_school">Update School</SelectItem>
            <SelectItem value="update_enquiry_status">Update Enquiry</SelectItem>
            <SelectItem value="approve_claim">Approve Claim</SelectItem>
            <SelectItem value="reject_claim">Reject Claim</SelectItem>
          </SelectContent>
        </Select>
        <Select value={targetType} onValueChange={(v) => { setTargetType(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Target type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="school">School</SelectItem>
            <SelectItem value="enquiry">Enquiry</SelectItem>
            <SelectItem value="claim">Claim</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.entries ?? []}
        loading={isLoading}
        page={page}
        pageCount={data?.total_pages ?? 1}
        total={data?.total}
        onPageChange={setPage}
      />
    </div>
  );
}
