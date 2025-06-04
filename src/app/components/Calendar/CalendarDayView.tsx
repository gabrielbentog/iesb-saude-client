// src/app/components/Calendar/CalendarDayView.tsx
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
  format,
  isSameDay,
  startOfDay,
  isBefore,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { HeaderCell, EventChip } from "./Calendar.styles";
import type { CalendarEvent, CalendarDayViewProps } from '@/app/types';


export function CalendarDayView({
  referenceDate,
  events,
  categoryConfig,
  onEventClick,
}: CalendarDayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const todayStart = startOfDay(new Date());

  const eventsForHour = (h: number) =>
    events.filter(
      (ev) => isSameDay(ev.date, referenceDate) && ev.date.getHours() === h
    );
  console.log("Events for hour:", eventsForHour);
  return (
    <>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ tableLayout: "fixed", minWidth: 600, borderCollapse: "collapse" }}>
          <TableHead>
            {/* ... Cabeçalho da tabela ... */}
            <TableRow sx={{ borderBottom: "2px solid", borderColor: "divider" }}>
              <HeaderCell sx={{ width: 80, fontSize: "0.85rem", py: 1 }}>
                <Typography variant="subtitle2">Hora</Typography>
              </HeaderCell>
              <HeaderCell sx={{ fontSize: "0.85rem", py: 1 }}>
                <Typography variant="subtitle2">
                  {format(referenceDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </Typography>
              </HeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hours.map((h) => {
              const items = eventsForHour(h);
              return (
                <TableRow key={h} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                  <TableCell sx={{ textAlign: "center", fontWeight: "bold", bgcolor: "grey.50" }}>
                    {h.toString().padStart(2, "0")}:00
                  </TableCell>
                  <TableCell sx={{ px: 1, py: 1, verticalAlign: "top" }}>
                    {items.map((ev) => {
                      const past = isBefore(ev.date, todayStart) && ev.type === 'busy';
                      const chipColor = categoryConfig[ev.category]?.color ?? (ev.type === 'free' ? "#66bb6a" : "#90a4ae");
                      return (
                        <Tooltip key={ev.id} title={ev.title}>
                          <EventChip
                            past={past}
                            color={chipColor}
                            isCurrentMonth={true} // Em DayView, sempre é o "mês corrente" do dia
                            onClick={() => onEventClick(ev)} // Chama o handler do pai
                          >
                            {format(ev.date, "HH:mm")} {ev.title}
                          </EventChip>
                        </Tooltip>
                      );
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Nenhum diálogo renderizado aqui */}
    </>
  );
}