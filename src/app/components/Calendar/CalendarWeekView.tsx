// src/app/components/Calendar/CalendarWeekView.tsx
"use client";

import React from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  startOfWeek,
  addDays,
  format,
  startOfDay,
  isBefore,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { HeaderCell, EventChip } from "./Calendar.styles";
import type { CalendarWeekViewProps } from '@/app/types';


export function CalendarWeekView({
  referenceDate,
  events,
  categoryConfig,
  onEventClick,
}: CalendarWeekViewProps) {
  const weekStart = startOfWeek(referenceDate, { locale: ptBR });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const todayStart = startOfDay(new Date());

  const getEventsFor = (day: Date, hour: number) =>
    events.filter(
      (ev) =>
        format(ev.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd") &&
        ev.date.getHours() === hour
    );

  return (
    <>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ tableLayout: "fixed", borderCollapse: "collapse", minWidth: 800 }}>
          <TableHead>
            {/* ... Cabeçalho da tabela ... */}
             <TableRow sx={{ borderBottom: "2px solid", borderColor: "divider" }}>
              <HeaderCell sx={{ width: 80, fontSize: "0.85rem", py: 1 }}>
                <Typography variant="subtitle2">Hora</Typography>
              </HeaderCell>
              {weekDays.map((day, i) => (
                <HeaderCell key={i} sx={{ textAlign: "center", fontSize: "0.85rem" }}>
                  <Typography variant="subtitle2">
                    {format(day, "EEE (dd)", { locale: ptBR })}
                  </Typography>
                </HeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {hours.map((hour) => (
              <TableRow key={hour} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                <TableCell sx={{ textAlign: "center", fontWeight: "bold", bgcolor: "grey.50" }}>
                  {hour.toString().padStart(2, "0")}:00
                </TableCell>
                {weekDays.map((day) => {
                  const dayEvents = getEventsFor(day, hour);
                  return (
                    <TableCell key={day.toISOString() + hour} sx={{ verticalAlign: "top", width: 120, px: 0.5, py: 0.5, borderRight: "1px solid", borderColor: "divider" }}>
                      {dayEvents.map((ev) => {
                        const past = isBefore(ev.date, todayStart) && ev.type === 'busy';
                        const chipColor = categoryConfig[ev.category]?.color ?? (ev.type === 'free' ? "#66bb6a" : "#90a4ae");
                        return (
                          <Tooltip key={ev.id} title={ev.title}>
                            <EventChip
                              past={past}
                              color={chipColor}
                              isCurrentMonth={true}
                              onClick={() => onEventClick(ev)} // Chama o handler do pai
                            >
                              {format(ev.date, "HH:mm")} {ev.title}
                            </EventChip>
                          </Tooltip>
                        );
                      })}
                    </TableCell>
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