export interface PaginationMeta {
  totalCount: number;      // total de registros
  perPage:    number;
  currentPage:number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { pagination: PaginationMeta };
}