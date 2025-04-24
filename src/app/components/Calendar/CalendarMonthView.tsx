"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfDay,
  format,
  isToday,
  isWeekend,
  isSameMonth,
  isBefore,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { HeaderCell, DayCell, DayNumber, EventChip } from "./Calendar.styles";
import { EventDetailDialog } from "./EventDetailDialog";

type EventCategory = string;

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  location?: string;
  category: EventCategory;
  allDay?: boolean;
  isRecurring?: boolean;
  timeSlotId?: number;
}

interface Props {
  currentMonth: Date;
  events: CalendarEvent[];
  categoryConfig: Record<EventCategory, { color: string }>;
  onDeleted: (info: {
    type: "single" | "series";
    id?: string;
    timeSlotId?: number;
  }) => void;
}

export function CalendarMonthView({
  currentMonth,
  events,
  categoryConfig,
  onDeleted,
}: Props) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { locale: ptBR });
  const calEnd = endOfWeek(monthEnd, { locale: ptBR });
  const todayStart = startOfDay(new Date());

  const matrix = useMemo(() => {
    const weeks: Date[][] = [];
    let d = calStart;
    while (d <= calEnd) {
      const w: Date[] = [];
      for (let i = 0; i < 7; i++) {
        w.push(d);
        d = addDays(d, 1);
      }
      weeks.push(w);
    }
    return weeks;
  }, [calStart, calEnd]);

  const eventsForDay = (day: Date) =>
    events.filter(
      (ev) => format(ev.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    );

  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const weekDays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  return (
    <>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ tableLayout: "fixed", borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow>
              {weekDays.map((d) => (
                <HeaderCell key={d}>
                  <Typography variant="subtitle2">{d}</Typography>
                </HeaderCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {matrix.map((week, wi) => (
              <TableRow key={wi}>
                {week.map((day, di) => {
                  const items = eventsForDay(day);
                  const sameMonth = isSameMonth(day, currentMonth);
                  const hasUpcoming = items.some(
                    (ev) => !isBefore(ev.date, todayStart)
                  );

                  return (
                    <DayCell
                      key={di}
                      isCurrentMonth={sameMonth}
                      isToday={isToday(day)}
                      isWeekend={isWeekend(day)}
                      hasEvents={hasUpcoming}
                    >
                      <DayNumber
                        isToday={isToday(day)}
                        isCurrentMonth={sameMonth}
                      >
                        {format(day, "d")}
                      </DayNumber>

                      {items.slice(0, 3).map((ev) => {
                        const past = isBefore(ev.date, todayStart);
                        const chipColor =
                          categoryConfig[ev.category]?.color ?? "#90a4ae";

                        return (
                          <Tooltip key={ev.id} title={ev.title}>
                            <EventChip
                              past={past}
                              isCurrentMonth={sameMonth}
                              color={chipColor}
                              onClick={() => !past && setSelected(ev)}
                              sx={{ mt: 0.25 }}
                            >
                              {ev.allDay
                                ? ev.title
                                : `${format(ev.date, "HH:mm")} ${ev.title}`}
                            </EventChip>
                          </Tooltip>
                        );
                      })}

                      {items.length > 3 && (
                        <Typography
                          variant="caption"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          + {items.length - 3} mais
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

      <EventDetailDialog
        open={Boolean(selected)}
        event={selected}
        onClose={() => setSelected(null)}
        onDeleted={onDeleted}
      />
    </>
  );
}
