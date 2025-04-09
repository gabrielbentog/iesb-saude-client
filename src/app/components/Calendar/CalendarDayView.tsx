// CalendarDayView.tsx
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
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { HeaderCell, EventChip } from "./Calendar.styles";

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  location?: string;
  category: string;
  allDay?: boolean;
  participants?: string[];
}

interface CalendarDayViewProps {
  referenceDate: Date;
  events: CalendarEvent[];
  categoryConfig: Record<string, { color: string; icon: React.ReactNode }>;
}

export function CalendarDayView({
  referenceDate,
  events,
  categoryConfig,
}: CalendarDayViewProps) {
  // Cria uma lista com as 24 horas do dia
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filtra eventos para uma determinada hora
  const getEventsForHour = (hour: number) => {
    return events.filter(
      (ev) => isSameDay(ev.date, referenceDate) && ev.date.getHours() === hour
    );
  };

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table
        sx={{
          tableLayout: "fixed",
          borderCollapse: "collapse",
          minWidth: 600,
        }}
      >
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
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(hour);
            return (
              <TableRow
                key={hour}
                sx={{ borderBottom: "2px solid", borderColor: "divider" }}
              >
                <TableCell
                  sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    bgcolor: "grey.50",
                  }}
                >
                  {`${hour.toString().padStart(2, "0")}:00`}
                </TableCell>
                <TableCell sx={{ verticalAlign: "top", px: 1, py: 1 }}>
                  {hourEvents.map((evt) => (
                    <Tooltip key={evt.id} title={evt.title}>
                      <EventChip
                        color={categoryConfig[evt.category].color}
                        isCurrentMonth={true}
                      >
                        {format(evt.date, "HH:mm")} {evt.title}
                      </EventChip>
                    </Tooltip>
                  ))}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
