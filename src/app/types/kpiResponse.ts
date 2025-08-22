export interface KpiResponse {
  data: {
    appointmentsToday: { total: number; percentChange: number }
    totalAppointments: { total: number; completed: number; pending: number }
    interns: { activeCount: number; specialtiesCount: number }
    appointmentsToApprove: number
    completionRate: number
  }
}

// Estrutura já adaptada aos nomes que sua UI usa.
// (mantive o que o componente espera para não reescrever tudo)
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