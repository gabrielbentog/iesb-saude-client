export interface KpiResponse {
  data: {
    appointmentsToday: { total: number; percentChange: number }
    totalAppointments: { total: number; completed: number; pending: number }
    interns: { activeCount: number; specialtiesCount: number }
    appointmentsToApprove: number
    completionRate: number
  }
}

export interface DashboardStats {
  appointmentsToday: number
  appointmentsTrend: number
  totalAppointments: number
  completedAppointments: number
  appointmentsToApprove: number
  pendingAppointments: number
  totalInterns: number
  completionRate: number // 0-100
}