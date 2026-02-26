"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  type PaginationState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  // Server-side pagination
  pageCount?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  total?: number;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  pageCount,
  page = 1,
  onPageChange,
  pageSize = 25,
  onPageSizeChange,
  total,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize,
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting, pagination },
    manualPagination: !!pageCount,
    pageCount: pageCount ?? -1,
  });

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider h-10"
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? "flex items-center gap-1 cursor-pointer select-none"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <ArrowUpDown className="size-3 text-slate-400" />
                      )}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                No results found.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={onRowClick ? "cursor-pointer" : ""}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-[13px] py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {(pageCount ?? 0) > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            {total !== undefined && <span>{total.toLocaleString()} total</span>}
            {onPageSizeChange && (
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded border border-slate-200 px-2 py-1 text-[12px]"
              >
                {[25, 50, 100].map((s) => (
                  <option key={s} value={s}>{s} per page</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => onPageChange?.(1)}
              disabled={page <= 1}
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="px-3 text-[13px] text-slate-600">
              {page} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= (pageCount ?? 1)}
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => onPageChange?.(pageCount ?? 1)}
              disabled={page >= (pageCount ?? 1)}
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
