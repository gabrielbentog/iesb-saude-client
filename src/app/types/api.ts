export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      total: number;
      perPage: number;
      currentPage: number;
      totalPages: number;
    };
  };
}

export type MetaWithPagination = {
  pagination?: {
    total: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
  };
  [key: string]: unknown;
};