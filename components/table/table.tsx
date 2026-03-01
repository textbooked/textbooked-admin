"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, RefreshCcw } from "lucide-react";
import type { ReactNode } from "react";

import type { EntityTableController } from "@/components/table/types";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EntityTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  rows: TData[];
  total: number;
  isLoading: boolean;
  controller: EntityTableController;
  searchPlaceholder?: string;
  leftSlot?: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  loadingLabel?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export function EntityTable<TData, TValue>({
  columns,
  rows,
  total,
  isLoading,
  controller,
  searchPlaceholder,
  leftSlot,
  emptyTitle,
  emptyDescription,
  loadingLabel,
  onRefresh,
  isRefreshing,
}: EntityTableProps<TData, TValue>) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            value={controller.state.query}
            onChange={(event) => controller.setQuery(event.target.value)}
            placeholder={searchPlaceholder ?? "Search..."}
            className="max-w-md"
          />
          {leftSlot}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-lg">
            {total} total
          </Badge>
          {onRefresh ? (
            <Button type="button" variant="outline" className="rounded-xl" onClick={onRefresh} disabled={isRefreshing}>
              {isRefreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
              Refresh
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border bg-muted/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {loadingLabel ?? "Loading..."}
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          sortField={controller.state.sortField}
          sortOrder={controller.state.sortOrder}
          onSort={controller.cycleSort}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      )}
    </div>
  );
}
