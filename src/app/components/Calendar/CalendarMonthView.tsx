// src/app/components/Calendar/CalendarMonthView.tsx
"use client";

import React, { useMemo } from "react";
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
import type { CalendarMonthViewProps } from '@/app/types';


export function CalendarMonthView({
  currentMonth,
  events,
  categoryConfig,
  onEventClick,
}: CalendarMonthViewProps) {
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
                  const hasUpcomingOrFreeSlots = items.some(
                    (ev) => ev.type === 'free' || !isBefore(ev.date, todayStart)
                  );

                  return (
                    <DayCell
                      key={di}
                      isCurrentMonth={sameMonth}
                      isToday={isToday(day)}
                      isWeekend={isWeekend(day)}
                      hasEvents={hasUpcomingOrFreeSlots} // Atualizado para refletir free slots também
                    >
                      <DayNumber isToday={isToday(day)} isCurrentMonth={sameMonth}>
                        {format(day, "d")}
                      </DayNumber>
                      {items.slice(0, 3).map((ev) => {
                        const past = isBefore(ev.date, todayStart) && ev.type === 'busy';
                        const chipColor = categoryConfig[ev.category]?.color ?? (ev.type === 'free' ? "#66bb6a" : "#90a4ae");
                        return (
                          <Tooltip key={ev.id} title={ev.title}>
                            <EventChip
                              past={past}
                              isCurrentMonth={sameMonth}
                              color={chipColor}
                              onClick={() => onEventClick(ev)} // Chama o handler do pai
                              sx={{ mt: 0.25 }}
                            >
                              {ev.allDay ? ev.title : `${format(ev.date, "HH:mm")} ${ev.title}`}
                            </EventChip>
                          </Tooltip>
                        );
                      })}
                      {items.length > 3 && (
                        <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
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
      {/* Nenhum diálogo renderizado aqui */}
    </>
  );
}