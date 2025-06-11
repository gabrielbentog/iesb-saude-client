import type React from "react";
import { MetaWithPagination } from "./api";

export interface ApiResponse<T> {
  data: T;
}

export interface Campus {
  id: number | string;
  name: string;
}

export interface Especialidade {
  id: number | string;
  name: string;
}

export interface Slot {
  id: number | string;
  startAt: string;
  endAt: string;
}

export interface ConsultaPaciente {
  id: number;
  internName: string;
  internAvatar?: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Confirmada' | 'Pendente' | 'Reagendada' | 'Cancelada' | 'Concluída';
  priority?: 'low' | 'normal' | 'high';
  specialtyIcon: React.ReactNode;
  location: string;
}

export interface ApiAppointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  timeSlot: {
    id: number;
    collegeLocationName: string;
    specialtyName: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    profile: {
      id: number;
      name: string;
      usersCount: number;
    };
  };
}

export interface PaginatedAppointmentsResponse {
  data: ApiAppointment[];
  meta: MetaWithPagination;
}

export interface Appointment {
  id: number;
  patientName: string;
  patientAvatar: string;
  internName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Confirmada' | 'Pendente' | 'Reagendada' | 'Cancelada' | 'Concluída';
  priority: 'low' | 'normal' | 'high';
  specialtyIcon: React.ReactNode;
}

export interface User {
  id: number;
  name: string | null;
  email: string;
  profileId: number;
  image: string | null;
  createdAt: string;
}

export interface Intern {
  id: number;
  name: string;
  specialty: string;
  avatar: string;
  appointmentsCompleted: number;
  appointmentsScheduled: number;
  status: 'Ativo' | 'Inativo';
  icon: React.ReactNode;
  performance: number;
}

export interface ApiIntern {
  id: number
  name: string
  specialty: string | null
  avatarUrl: string | null
  appointmentsCompleted: number
  appointmentsScheduled: number
  status: "Ativo" | "Inativo"
  performance: number        // 0-100
}
