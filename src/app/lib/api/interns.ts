// src/app/lib/api/interns.ts
import { apiFetch } from "@/app/lib/api";
import type { Intern, PaginatedResponse, MetaWithPagination } from "@/app/types";

export async function fetchInterns(
  userId: number,
  page: number,
  size: number,
  extraParams = ""
): Promise<PaginatedResponse<Intern>> {
  const query = `page[number]=${page}&page[size]=${size}${extraParams}`;
  const raw   = await apiFetch<{
    data: Intern[];
    meta: Record<string, unknown>;
  }>(`/api/users/${userId}/interns?${query}`);

  // ---------------- normalização do meta ----------------
  const meta = raw.meta as MetaWithPagination;

  const pagination =
    meta.pagination ??
    {
      total:        Number(meta.total_count ?? 0),
      per_page:     Number(meta.per_page ?? 0),
      current_page: Number(meta.current_page ?? 0),
      total_pages:  Number(meta.total_pages ?? 0),
    };

  return {
    data: raw.data,
    meta: { pagination },
  };
}
