import { parseISO, isToday, isTomorrow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { UserData } from "@/app/types"
export interface RawAppointment {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  notes?: string
  createdAt: string
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
  interns?: {
    id: string
    name: string
    avatarUrl?: string
  }[]
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

export interface RawStatusHistory {
  id: string;
  fromStatus: AppointmentStatus;
  toStatus: AppointmentStatus;
  changedAt: string;        // ISO
  changedBy?: UserData;
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
  interns?: {
    id: string
    name: string
    avatarUrl?: string
  }[]
  specialty: string
  location: string      // ← novo
  room: string          // ← novo
  date: string
  time: string
  status: string
  icon: React.ReactNode
  priority: "high" | "normal" | "low"
}

export type RawAppointmentStatus =
  | 'pending'
  | 'admin_confirmed'
  | 'patient_confirmed'
  | 'cancelled_by_admin'
  | 'patient_cancelled'
  | 'rejected'
  | 'completed'

/* Mapeia status enum->texto */
export const STATUS_LABEL: Record<RawAppointmentStatus, string> = {
  pending:            'Aguardando aprovação',
  admin_confirmed:    'Aguardando confirmação do Paciente',
  patient_confirmed:  'Confirmada',
  cancelled_by_admin: 'Cancelada pelo gestor',
  patient_cancelled:  'Cancelada pelo paciente',
  rejected:           'Rejeitada',
  completed:          'Concluída',
}

export type AppointmentStatus =
  (typeof STATUS_LABEL)[keyof typeof STATUS_LABEL]

/* Decide prioridade visual pela situação */
export const statusPriority = (status: AppointmentStatus): UIAppointment["priority"] => {
  if (status === "pending") return "high"
  if (status === "admin_confirmed") return "low"
  return "normal"
}

/* Converte YYYY-MM-DD p/ "Hoje" | "Amanhã" | dd/MM */
export const humanDate = (isoDate: string) => {
  const d = parseISO(isoDate)
  if (isToday(d))     return "Hoje"
  if (isTomorrow(d)) return "Amanhã"
  return format(d, "dd/MM", { locale: ptBR })
}