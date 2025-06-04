export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

export type MetaWithPagination = {
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
  [key: string]: unknown;
};