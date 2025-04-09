// CalendarMonthView.tsx
import React, { useMemo } from "react";
import { Table, TableBody, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isToday, isWeekend, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { HeaderCell, DayCell, DayNumber, EventChip } from "./Calendar.styles";

type EventCategory = "medical" | "training" | "work" | "holiday";

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

interface CalendarMonthViewProps {
  currentMonth: Date;
  events: CalendarEvent[];
  categoryConfig: Record<EventCategory, { color: string; icon: React.ReactNode }>;
}

export function CalendarMonthView({
  currentMonth,
  events,
  categoryConfig,
}: CalendarMonthViewProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

  const dayMatrix = useMemo(() => {
    const matrix: Date[][] = [];
    let tempDate = calendarStart;
    while (tempDate <= calendarEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(tempDate);
        tempDate = addDays(tempDate, 1);
      }
      matrix.push(week);
    }
    return matrix;
  }, [calendarStart, calendarEnd]);

  const getEventsForDay = (day: Date) =>
    events.filter((ev) => format(ev.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"));

  const weekDays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table sx={{ tableLayout: "fixed", borderCollapse: "collapse" }}>
        <TableHead>
          <TableRow>
            {weekDays.map((dayName) => (
              <HeaderCell key={dayName}>
                <Typography variant="subtitle2">{dayName}</Typography>
              </HeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dayMatrix.map((week, wIndex) => (
            <TableRow key={wIndex}>
              {week.map((day, dIndex) => {
                const isCurrent = isSameMonth(day, currentMonth);
                const dayEvents = getEventsForDay(day);
                const isWeekendDay = isWeekend(day);
                return (
                  <DayCell
                    key={dIndex}
                    isCurrentMonth={isCurrent}
                    isToday={isToday(day)}
                    isWeekend={isWeekendDay}
                    hasEvents={dayEvents.length > 0}
                  >
                    <DayNumber isToday={isToday(day)} isCurrentMonth={isCurrent}>
                      {format(day, "d")}
                    </DayNumber>
                    {dayEvents.slice(0, 3).map((evt) => (
                      <Tooltip key={evt.id} title={evt.title}>
                        <EventChip
                          color={categoryConfig[evt.category].color}
                          isCurrentMonth={isCurrent}
                        >
                          {evt.allDay ? evt.title : `${format(evt.date, "HH:mm")} ${evt.title}`}
                        </EventChip>
                      </Tooltip>
                    ))}
                    {dayEvents.length > 3 && (
                      <Typography
                        variant="caption"
                        sx={{ textAlign: "center", display: "block", mt: 0.5 }}
                      >
                        + {dayEvents.length - 3} mais
                      </Typography>
                    )}
                  </DayCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
