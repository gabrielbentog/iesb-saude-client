import { parseISO, isToday, isTomorrow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
export interface RawAppointment {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  notes?: string
  user: {
    id: string
    name: string
    avatarUrl?: string
    email?: string
    phone?: string
    cpf?: string
  }
  intern?: {
    id: string
    name: string
    avatarUrl?: string
  }
  timeSlot?: {
    id: string
    collegeLocationName?: string
    specialtyName?: string
  }
  consultationRoom?: {
    id: string
    name: string
    collegeLocationName?: string
    specialtyName?: string
  }
}

export interface AppointmentsResponse {
  data?: RawAppointment[]          // se usa adapter :json_api
  meta: {
    pagination: {
      total_count: number
      total_pages: number
      current_page: number
      per_page: number
    }
  }
}

/* Objeto usado pela tabela já no formato esperado pelo render */
export interface UIAppointment {
  id: string
  patientName: string
  patientAvatar: string
  intern?: {
    id: string
    name: string
    avatarUrl?: string
  }
  specialty: string
  location: string      // ← novo
  room: string          // ← novo
  date: string
  time: string
  status: string
  icon: React.ReactNode
  priority: "high" | "normal" | "low"
}

/* Mapeia status enum->texto */
export const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  rejected: "Rejeitada",
  cancelled: "Cancelada",
  completed: "Concluída",
}

/* Decide prioridade visual pela situação */
export const statusPriority = (status: string): UIAppointment["priority"] => {
  if (status === "Pendente" || status === "pending") return "high"
  if (status === "Rescheduled" || status === "reagendada") return "low"
  return "normal"
}

/* Converte YYYY-MM-DD p/ "Hoje" | "Amanhã" | dd/MM */
export const humanDate = (isoDate: string) => {
  const d = parseISO(isoDate)
  if (isToday(d))     return "Hoje"
  if (isTomorrow(d)) return "Amanhã"
  return format(d, "dd/MM", { locale: ptBR })
}