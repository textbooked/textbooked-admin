"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  sortField?: string | null;
  sortOrder?: "ASC" | "DESC" | null;
  onSort?: (field: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  sortField,
  sortOrder,
  onSort,
  emptyTitle = "No rows yet",
  emptyDescription = "Data will appear here once records are created.",
  className,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!data.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className={cn("min-h-[280px]", className)}
      />
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card", className)}>
      <Table>
        <TableHeader className="bg-muted/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-4">
                  {header.isPlaceholder ? null : onSort && header.column.id !== "actions" ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-left font-medium"
                      onClick={() => onSort(header.column.id)}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sortField === header.column.id && sortOrder === "ASC" ? "↑" : null}
                      {sortField === header.column.id && sortOrder === "DESC" ? "↓" : null}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
