import type { AdminListDto, AdminSortDtoOrder } from "@/lib/api/generated/schemas";

export type EntityTableState = {
  query: string;
  sortField: string | null;
  sortOrder: AdminSortDtoOrder | null;
  page: number;
  perPage: number;
};

export type EntityTableController = {
  state: EntityTableState;
  payload: AdminListDto;
  setQuery: (value: string) => void;
  cycleSort: (field: string) => void;
  setPage: (value: number) => void;
  setPerPage: (value: number) => void;
};
