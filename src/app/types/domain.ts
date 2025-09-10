import type React from "react";
import { MetaWithPagination } from "./api";

export interface ApiResponse<T> {
  data: T;
}

export interface Campus {
  id: string;
  name: string;
}

export interface Especialidade {
  id: string;
  name: string;
}

export interface Slot {
  id: string;
  startAt: string;
  endAt: string;
}

export interface ConsultaPaciente {
  id: string;
  internName: string;
  internAvatar?: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Confirmada' | 'Aguardando aprovação' | 'Reagendada' | 'Cancelada' | 'Concluída';
  priority?: 'low' | 'normal' | 'high';
  specialtyIcon: React.ReactNode;
  location: string;
}

export interface ApiAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  timeSlot: {
    id: string;
    collegeLocationName: string;
    specialtyName: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
    createdAt: string;
    updatedAt: string;
    profile: {
      id: string;
      name: string;
      usersCount: number;
    };
  };
}

export interface PaginatedAppointmentsResponse {
  data: ApiAppointment[];
  meta: MetaWithPagination;
}

export interface User {
  id: string;
  name: string | null;
  phone?: string | null;
  cpf?: string | null;
  email: string;
  profileId: number;
  image: string | null;
  createdAt: string;
}

export interface Intern {
  id: string;
  name: string;
  registrationCode?: string;
  specialty: string;
  avatar: string;
  appointmentsCompleted: number;
  appointmentsScheduled: number;
  status: 'Ativo' | 'Inativo';
  icon: React.ReactNode;
  performance: number;
}

export interface ApiIntern {
  id: string
  name: string
  registrationCode?: string
  specialty: string | null
  avatarUrl: string | null
  appointmentsCompleted: number
  appointmentsScheduled: number
  status: "Ativo" | "Inativo"
  performance: number        // 0-100
}
