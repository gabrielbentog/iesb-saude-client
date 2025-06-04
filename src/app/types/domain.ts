import type React from "react";
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
  start_at: string;
  end_at: string;
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
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  time_slot: {
    id: number;
    college_location_name: string;
    specialty_name: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    profile: {
      id: number;
      name: string;
      users_count: number;
    };
  };
}

export interface MetaInfo {
  total_count: number;
  total_pages: number;
  current_page: number;
  per_page: number;
}

export interface PaginatedAppointmentsResponse {
  data: ApiAppointment[];
  meta: MetaInfo;
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
  profile_id: number;
  image: string | null;
  created_at: string;
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
