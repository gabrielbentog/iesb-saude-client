export interface PaginationMeta {
  totalCount: number;
  perPage:    number;
  currentPage:number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { pagination: PaginationMeta };
}