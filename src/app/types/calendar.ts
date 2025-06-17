export type EventCategory = 'medical' | 'training' | 'work' | 'holiday' | string;

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  location?: string;
  category: EventCategory;
  allDay?: boolean;
  participants?: string[];
  isRecurring?: boolean;
  timeSlotId?: string;
  type: 'free' | 'busy';
}

export interface BookingDialogProps {
  open: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onSubmitBooking: (bookingData: { objective: string }) => Promise<void>;
}

export interface CalendarDayViewProps {
  referenceDate: Date;
  events: CalendarEvent[];
  categoryConfig: Record<string, { color: string }>;
  onEventClick: (event: CalendarEvent) => void;
}

export interface CalendarWeekViewProps {
  referenceDate: Date;
  events: CalendarEvent[];
  categoryConfig: Record<string, { color: string }>;
  onEventClick: (event: CalendarEvent) => void;
}

export interface CalendarMonthViewProps {
  currentMonth: Date;
  events: CalendarEvent[];
  categoryConfig: Record<string, { color: string }>;
  onEventClick: (event: CalendarEvent) => void;
}

export interface CalendarHeaderProps {
  title: string;
  viewMode: 'month' | 'week' | 'day';
  dateDisplay: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (v: 'month' | 'week' | 'day') => void;
  campusList: string[];
  specialtyList: string[];
  campusFilters: string[];
  specialtyFilters: string[];
  onToggleCampus: (c: string) => void;
  onToggleSpecialty: (s: string) => void;
  onClearFilters: () => void;
  showScheduleButton?: boolean;
  onScheduleClick?: () => void;
}

export interface EnhancedCalendarProps {
  showScheduleButton: boolean;
  userProfile?: 'paciente' | 'gestor' | 'estagiario' | string;
}

export interface EventDetail {
  id: string;
  date: Date;
  title: string;
  description?: string;
  location?: string;
  allDay?: boolean;
  isRecurring?: boolean;
  timeSlotId?: string;
}

export interface EventDetailDialogProps {
  open: boolean;
  event: EventDetail | null;
  onClose: () => void;
  onDeleted: (info: { type: 'single' | 'series'; id?: string; timeSlotId?: string }) => void;
}

export type CollegeLocation = { id: string; name: string };
export type SimpleSpec = { id: string; name: string };
export type ApiSlot = {
  id: string;
  startAt: string;
  campusName: string;
  specialtyName: string;
  timeSlotId?: string;
  patientName?: string;
  isRecurring?: boolean;
};
export type CalendarApi = { free: ApiSlot[]; busy: ApiSlot[] };
export type ViewMode = 'month' | 'week' | 'day';
export type ColorMap = Record<string, { color: string }>;
