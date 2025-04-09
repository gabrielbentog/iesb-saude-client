// CalendarWeekView.tsx
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
import { startOfWeek, addDays, format } from "date-fns";
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

interface CalendarWeekViewProps {
  referenceDate: Date;
  events: CalendarEvent[];
  categoryConfig: Record<string, { color: string; icon: React.ReactNode }>;
}

export function CalendarWeekView({
  referenceDate,
  events,
  categoryConfig,
}: CalendarWeekViewProps) {
  // Início da semana (usando domingo como padrão)
  const weekStart = startOfWeek(referenceDate, { locale: ptBR });
  // Gera os 7 dias da semana
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  // Cria uma lista com as 24 horas do dia
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filtra eventos para um dia e hora específicos
  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter((ev) => {
      const sameDay = format(ev.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
      return sameDay && ev.date.getHours() === hour;
    });
  };

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table
        sx={{
          tableLayout: "fixed",
          borderCollapse: "collapse",
          minWidth: 800,
        }}
      >
        <TableHead>
          <TableRow sx={{ borderBottom: "2px solid", borderColor: "divider" }}>
            <HeaderCell sx={{ width: 80, fontSize: "0.85rem", py: 1 }}>
              <Typography variant="subtitle2">Hora</Typography>
            </HeaderCell>
            {weekDays.map((day, i) => (
              <HeaderCell key={i} sx={{ fontSize: "0.85rem", py: 1, textAlign: "center" }}>
                <Typography variant="subtitle2">
                  {format(day, "EEE (dd)", { locale: ptBR })}
                </Typography>
              </HeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {hours.map((hour) => (
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
              {weekDays.map((day, dIndex) => {
                const dayEvents = getEventsForDayAndHour(day, hour);
                return (
                  <TableCell
                    key={dIndex}
                    sx={{
                      verticalAlign: "top",
                      width: 120,
                      px: 0.5,
                      py: 0.5,
                      borderRight: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {dayEvents.map((evt) => (
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
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
