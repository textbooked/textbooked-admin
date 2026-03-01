import type { AdminListResponseDto } from "@/lib/api/generated/schemas";

export function getListRows<T>(value: AdminListResponseDto | undefined): T[] {
  return (value?.data ?? []) as T[];
}

export function getListTotal(value: AdminListResponseDto | undefined): number {
  if (!value) {
    return 0;
  }

  return typeof value.total === "number" ? value.total : value.data.length;
}
