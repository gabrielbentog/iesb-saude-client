"use client";

import React, { useState } from "react";
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
import { EventDetailDialog } from "./EventDetailDialog";

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  location?: string;
  category: string;
  allDay?: boolean;
  isRecurring?: boolean;
  timeSlotId?: number;
}

interface Props {
  referenceDate: Date;
  events: CalendarEvent[];
  categoryConfig: Record<string, { color: string }>;
  onDeleted: (info: {
    type: "single" | "series";
    id?: string;
    timeSlotId?: number;
  }) => void;
}

export function CalendarWeekView({
  referenceDate,
  events,
  categoryConfig,
  onDeleted,
}: Props) {
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

  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  return (
    <>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table
          sx={{ tableLayout: "fixed", borderCollapse: "collapse", minWidth: 800 }}
        >
          <TableHead>
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
                <TableCell
                  sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    bgcolor: "grey.50",
                  }}
                >
                  {hour.toString().padStart(2, "0")}:00
                </TableCell>

                {weekDays.map((day) => {
                  const dayEvents = getEventsFor(day, hour);
                  return (
                    <TableCell
                      key={day.toISOString() + hour}
                      sx={{
                        verticalAlign: "top",
                        width: 120,
                        px: 0.5,
                        py: 0.5,
                        borderRight: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {dayEvents.map((ev) => {
                        const past = isBefore(ev.date, todayStart);
                        const chipColor =
                          categoryConfig[ev.category]?.color ?? "#90a4ae";
                        return (
                          <Tooltip key={ev.id} title={ev.title}>
                            <EventChip
                              past={past}
                              color={chipColor}
                              isCurrentMonth={true}
                              onClick={() => !past && setSelected(ev)}
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

      {/* diálogo */}
      <EventDetailDialog
        open={Boolean(selected)}
        event={selected}
        onClose={() => setSelected(null)}
        onDeleted={onDeleted}
      />
    </>
  );
}
