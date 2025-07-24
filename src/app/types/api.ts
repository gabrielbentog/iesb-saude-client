export type MetaWithPagination = {
  pagination?: {
    totalCount: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
  };
  [key: string]: unknown;
};

export type CollegeLocation = { id: string; name: string };
export type ApiResponseCollegeLocations = {
  data: CollegeLocation[];
  meta?: MetaWithPagination;
};

export type SimpleSpec = { id: string; name: string };
