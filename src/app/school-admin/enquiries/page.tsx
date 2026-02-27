"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import {
  getSchoolAdminEnquiries,
  updateSchoolAdminEnquiry,
  disputeEnquiry,
} from "@/lib/school-admin-api";
import { DataTable } from "@/components/admin/DataTable";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import EnquiryDetailSheet from "@/components/school-admin/EnquiryDetailSheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { toast } from "react-hot-toast";
import type { SchoolAdminEnquiry } from "@/types";

const columns: ColumnDef<SchoolAdminEnquiry>[] = [
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
    accessorKey: "child_grade",
    header: "Grade",
    cell: ({ row }) => row.original.child_grade || "—",
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => row.original.source ? (
      <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
        {row.original.source}
      </span>
    ) : "—",
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "is_billed",
    header: "Billed",
    cell: ({ row }) =>
      row.original.is_billed ? (
        <span className="text-[11px] font-medium text-emerald-700">
          {row.original.billed_amount != null && row.original.billed_amount > 0
            ? `AED ${row.original.billed_amount}`
            : "Credit"}
        </span>
      ) : (
        <span className="text-[11px] text-slate-400">—</span>
      ),
  },
];

export default function SchoolAdminEnquiriesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<SchoolAdminEnquiry | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["school-admin-enquiries", page, search, statusFilter],
    queryFn: () =>
      getSchoolAdminEnquiries({
        page,
        limit: 25,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateSchoolAdminEnquiry(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-admin-enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["school-admin-dashboard"] });
      toast.success("Enquiry updated");
      setSelectedEnquiry(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const disputeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      disputeEnquiry(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["school-admin-enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["school-admin-credits"] });
      toast.success(data.message);
      setSelectedEnquiry(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Enquiries"
        description="Manage parent enquiries and leads"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 text-[13px]"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px] text-[13px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="sent_to_school">Sent to school</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="enrolled">Enrolled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.enquiries ?? []}
        loading={isLoading}
        page={page}
        pageCount={data?.pageCount ?? 1}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onRowClick={setSelectedEnquiry}
      />

      <EnquiryDetailSheet
        enquiry={selectedEnquiry}
        open={!!selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        onUpdateStatus={(id, status) => updateMutation.mutate({ id, status })}
        onDispute={(id, reason) => disputeMutation.mutate({ id, reason })}
        isUpdating={updateMutation.isPending || disputeMutation.isPending}
      />
    </div>
  );
}
