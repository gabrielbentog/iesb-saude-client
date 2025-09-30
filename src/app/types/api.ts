export type MetaWithPagination = {
  pagination?: {
    totalCount: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
  };
  // optional KPI counts returned by some endpoints
  nextAppointmentCount?: number;
  completedAppointmentsCount?: number;
  [key: string]: unknown;
};

export type CollegeLocation = { id: string; name: string };
export type ApiResponseCollegeLocations = {
  data: CollegeLocation[];
  meta?: MetaWithPagination;
};

export type SimpleSpec = { id: string; name: string };

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  data?: Record<string, unknown>;
  url?: string;
  appointment_id?: string | null;
  created_at: string;
}
