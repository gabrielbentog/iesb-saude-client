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
  format,
  isSameDay,
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

export function CalendarDayView({
  referenceDate,
  events,
  categoryConfig,
  onDeleted,
}: Props) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const todayStart = startOfDay(new Date());

  const eventsForHour = (h: number) =>
    events.filter(
      (ev) => isSameDay(ev.date, referenceDate) && ev.date.getHours() === h
    );

  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  return (
    <>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ tableLayout: "fixed", minWidth: 600, borderCollapse: "collapse" }}>
          <TableHead>
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
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontWeight: "bold",
                      bgcolor: "grey.50",
                    }}
                  >
                    {h.toString().padStart(2, "0")}:00
                  </TableCell>

                  <TableCell sx={{ px: 1, py: 1, verticalAlign: "top" }}>
                    {items.map((ev) => {
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
                </TableRow>
              );
            })}
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
