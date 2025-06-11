/* utils/appointment-mapper.ts ------------------------------ */
import { parseISO, format, isToday, isTomorrow } from "date-fns"
import { ptBR } from "date-fns/locale"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import PsychologyIcon from "@mui/icons-material/Psychology"
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter"
import AssignmentIcon from "@mui/icons-material/Assignment" 
import { RawAppointment, UIAppointment } from "../types/appointments"

const STATUS_LABEL: Record<string, UIAppointment["status"]> = {
  confirmed:  "Confirmada",
  pending:    "Pendente",
  rescheduled:"Reagendada",
  canceled:   "Cancelada",
  completed:  "Concluída",
}

export const statusPriority = (raw: string): UIAppointment["priority"] =>
  raw === "pending" ? "high" :
  raw === "rescheduled" ? "low" : "normal"

export const humanDate = (iso: string) => {
  const d = parseISO(iso)
  if (isToday(d)) return "Hoje"
  if (isTomorrow(d)) return "Amanhã"
  return format(d, "dd/MM", { locale: ptBR })
}

import React from "react"

export const specialtyIcon = (name?: string) => {
  switch (name) {
    case "Nutrição":     return React.createElement(RestaurantIcon, { fontSize: "small" })
    case "Psicologia":   return React.createElement(PsychologyIcon, { fontSize: "small" })
    case "Fisioterapia": return React.createElement(FitnessCenterIcon, { fontSize: "small" })
    default:             return React.createElement(AssignmentIcon, { fontSize: "small" })
  }
}

export const mapRaw = (a: RawAppointment): UIAppointment => {
  const specialty = a.timeSlot?.specialtyName ?? "-"
  const location  = a.consultationRoom?.collegeLocationName ??
                    a.timeSlot?.collegeLocationName ?? "-"
  return {
    id: a.id,
    patientName: a.user.name,
    patientAvatar: "",
    intern: a.intern?.name ?? "-", // preencha quando API trouxer
    internName: "", // preencha quando API trouxer
    specialty,
    location,
    room: a.consultationRoom?.name ?? "-",
    date: humanDate(a.date),
    time: format(parseISO(a.startTime), "HH:mm"),
    status: STATUS_LABEL[a.status] ?? (a.status as UIAppointment["status"]),
    priority: statusPriority(a.status),
    icon: specialtyIcon(specialty),
  }
}
