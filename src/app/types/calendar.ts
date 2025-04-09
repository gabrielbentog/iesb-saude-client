export type EventCategory = "medical" | "training" | "work" | "holiday";

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  location?: string;
  category: EventCategory;
  allDay?: boolean;
  participants?: string[];
}
