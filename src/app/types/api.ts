export type MetaWithPagination = {
  pagination?: {
    totalCount: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
  };
  [key: string]: unknown;
};
