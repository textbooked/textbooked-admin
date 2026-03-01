"use client";

import { useMemo, useState } from "react";

import type { EntityTableController } from "@/components/table/types";
import type { AdminListDto, AdminSortDtoOrder } from "@/lib/api/generated/schemas";

type UseEntityTableStateInput = {
  initialSortField?: string | null;
  initialSortOrder?: AdminSortDtoOrder | null;
  initialPerPage?: number;
};

export function useEntityTableState(input: UseEntityTableStateInput): EntityTableController {
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(input.initialSortField ?? null);
  const [sortOrder, setSortOrder] = useState<AdminSortDtoOrder | null>(input.initialSortOrder ?? null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(input.initialPerPage ?? 100);

  const payload = useMemo<AdminListDto>(() => {
    const queryValue = query.trim();

    return {
      filter: queryValue ? { query: queryValue } : undefined,
      pagination: { page, perPage },
      sort: sortField && sortOrder ? { field: sortField, order: sortOrder } : undefined,
    };
  }, [page, perPage, query, sortField, sortOrder]);

  function cycleSort(field: string) {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("ASC");
      setPage(1);
      return;
    }

    if (sortOrder === "ASC") {
      setSortOrder("DESC");
      setPage(1);
      return;
    }

    if (sortOrder === "DESC") {
      setSortField(null);
      setSortOrder(null);
      setPage(1);
      return;
    }

    setSortField(field);
    setSortOrder("ASC");
    setPage(1);
  }

  return {
    state: { query, sortField, sortOrder, page, perPage },
    payload,
    setQuery: (value) => {
      setQuery(value);
      setPage(1);
    },
    cycleSort,
    setPage,
    setPerPage: (value) => {
      setPerPage(value);
      setPage(1);
    },
  };
}
