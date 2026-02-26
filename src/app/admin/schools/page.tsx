"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface AdminSchool {
  id: string;
  slug: string;
  name: string;
  type: string;
  area: string;
  curriculum: string[];
  khda_rating: string;
  google_rating: number | null;
  fee_min: number | null;
  fee_max: number | null;
  is_active: boolean;
  is_verified: boolean;
  is_featured: boolean;
  has_summary: boolean;
  has_google: boolean;
  has_fees: boolean;
  has_email: boolean;
  has_photos: boolean;
}

const columns: ColumnDef<AdminSchool, unknown>[] = [
  {
    accessorKey: "name",
    header: "School",
    cell: ({ row }) => (
      <div className="max-w-[280px]">
        <p className="font-medium text-slate-900 truncate">{row.original.name}</p>
        <p className="text-[11px] text-slate-400 truncate">{row.original.area} &middot; {row.original.type}</p>
      </div>
    ),
  },
  {
    accessorKey: "curriculum",
    header: "Curriculum",
    cell: ({ row }) => (
      <span className="text-[12px] text-slate-600">
        {row.original.curriculum?.join(", ") || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "khda_rating",
    header: "KHDA",
    cell: ({ row }) => row.original.khda_rating || "N/A",
  },
  {
    accessorKey: "fee_min",
    header: "Fees",
    cell: ({ row }) =>
      row.original.fee_min
        ? `${(row.original.fee_min / 1000).toFixed(0)}k-${row.original.fee_max ? (row.original.fee_max / 1000).toFixed(0) + "k" : "?"}`
        : "N/A",
  },
  {
    accessorKey: "google_rating",
    header: "Google",
    cell: ({ row }) => row.original.google_rating?.toFixed(1) || "N/A",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.is_verified && <StatusBadge status="verified" />}
        {row.original.is_featured && <StatusBadge status="featured" />}
        {!row.original.is_active && <StatusBadge status="inactive" />}
      </div>
    ),
  },
  {
    id: "quality",
    header: "Quality",
    cell: ({ row }) => {
      const checks = [
        row.original.has_fees,
        row.original.has_summary,
        row.original.has_google,
        row.original.has_email,
        row.original.has_photos,
      ];
      const score = checks.filter(Boolean).length;
      const pct = Math.round((score / checks.length) * 100);
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444",
              }}
            />
          </div>
          <span className="text-[11px] text-slate-500">{pct}%</span>
        </div>
      );
    },
  },
];

export default function AdminSchoolsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [rating, setRating] = useState("");
  const [verified, setVerified] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-schools", search, type, rating, verified, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      if (rating) params.set("rating", rating);
      if (verified) params.set("verified", verified);

      const res = await fetch(`/api/admin/schools?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 60,
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Schools"
        description={`${data?.total ?? 0} schools in database`}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search by name, area, slug..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={type} onValueChange={(v) => { setType(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="school">School</SelectItem>
            <SelectItem value="nursery">Nursery</SelectItem>
          </SelectContent>
        </Select>
        <Select value={rating} onValueChange={(v) => { setRating(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="KHDA Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="Outstanding">Outstanding</SelectItem>
            <SelectItem value="Very Good">Very Good</SelectItem>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Acceptable">Acceptable</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verified} onValueChange={(v) => { setVerified(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Verified" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.schools ?? []}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        pageCount={data?.total_pages ?? 1}
        total={data?.total}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onRowClick={(row) => router.push(`/admin/schools/${row.id}`)}
      />
    </div>
  );
}
