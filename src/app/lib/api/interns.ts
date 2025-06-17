// src/app/lib/api/interns.ts
import { apiFetch } from "@/app/lib/api";
import type { Intern, PaginatedResponse, MetaWithPagination } from "@/app/types";

export async function fetchInterns(
  page: number,
  size: number,
  extraParams = ""
): Promise<PaginatedResponse<Intern>> {
  const query = `page[number]=${page}&page[size]=${size}${extraParams}`;
  const raw   = await apiFetch<{
    data: Intern[];
    meta: Record<string, unknown>;
  }>(`/api/interns?${query}`);

  // ---------------- normalização do meta ----------------
  const meta = raw.meta as MetaWithPagination;

  const pagination =
    meta.pagination ??
    {
      totalCount:       Number(meta.totalCount ?? 0),
      perPage:     Number(meta.perPage ?? 0),
      currentPage: Number(meta.currentPage ?? 0),
      totalPages:  Number(meta.totalPages ?? 0),
    };

  return {
    data: raw.data,
    meta: { pagination },
  };
}
