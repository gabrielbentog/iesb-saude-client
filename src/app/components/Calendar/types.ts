export type EventCategory = "medical" | "training" | "work" | "holiday" | string; // Allow any string for dynamic categories

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  location?: string;
  category: EventCategory;
  allDay?: boolean;
  participants?: string[];
  isRecurring?: boolean; // Added property
  timeSlotId?: number; // Added this property
  type: 'free' | 'busy';
}
