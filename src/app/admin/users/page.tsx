"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import ChartCard from "@/components/admin/ChartCard";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
  preferred_curricula: string[] | null;
  preferred_areas: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  saved_count: number;
  enquiry_count: number;
}

const PIE_COLORS = ["#FF6B35", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

const columns: ColumnDef<AdminUser, unknown>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-slate-900">{row.original.name || "Unknown"}</p>
        <p className="text-[11px] text-slate-400">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Signed Up",
    cell: ({ row }) => (
      <span className="text-[12px] text-slate-500">
        {new Date(row.original.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </span>
    ),
  },
  {
    accessorKey: "saved_count",
    header: "Saved",
    cell: ({ row }) => row.original.saved_count,
  },
  {
    accessorKey: "enquiry_count",
    header: "Enquiries",
    cell: ({ row }) => row.original.enquiry_count,
  },
  {
    accessorKey: "preferred_curricula",
    header: "Curricula",
    cell: ({ row }) => (
      <span className="text-[12px] text-slate-500">
        {row.original.preferred_curricula?.join(", ") || "None"}
      </span>
    ),
  },
  {
    accessorKey: "budget_min",
    header: "Budget",
    cell: ({ row }) => {
      const min = row.original.budget_min;
      const max = row.original.budget_max;
      if (!min && !max) return <span className="text-slate-400">N/A</span>;
      return (
        <span className="text-[12px]">
          {min ? `${(min / 1000).toFixed(0)}k` : "?"} - {max ? `${(max / 1000).toFixed(0)}k` : "?"}
        </span>
      );
    },
  },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 60,
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Users"
        description={`${data?.total ?? 0} registered users`}
        actions={<Users className="size-5 text-slate-400" />}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Signups Over Time (90d)" loading={isLoading}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.charts?.signups_over_time ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                tickFormatter={(v) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #E2E8F0" }} />
              <Bar dataKey="count" fill="#FF6B35" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Preferred Curricula" loading={isLoading}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data?.charts?.curriculum_distribution ?? []}
                dataKey="count"
                nameKey="curriculum"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={45}
                paddingAngle={2}
                label={({ name, percent }) =>
                  `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                labelLine={{ stroke: "#94A3B8" }}
              >
                {(data?.charts?.curriculum_distribution ?? []).map((_: unknown, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.users ?? []}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        pageCount={data?.total_pages ?? 1}
        total={data?.total}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    </div>
  );
}
