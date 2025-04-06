"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
} from "@mui/material";
import { 
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

// Exemplo de lista de eventos
interface CalendarEvent {
  date: Date;
  title: string;
}

const sampleEvents: CalendarEvent[] = [
  { date: new Date(2025, 1, 2, 13, 0), title: "Domingo de Carnaval" },
  { date: new Date(2025, 1, 3, 19, 15), title: "Carnaval (Segunda-feira)" },
  { date: new Date(2025, 1, 5, 8, 15), title: "Cinzas (até 14 horas)" },
  // ...
];

// Cabeçalho (dias da semana)
const HeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  textAlign: "center",
  backgroundColor: theme.palette.grey[200],
}));

// Célula do dia, com controle para isCurrentMonth e isToday
const DayCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== "isCurrentMonth" && prop !== "isToday",
})<{ isCurrentMonth: boolean; isToday: boolean }>(
  ({ theme, isCurrentMonth, isToday }) => ({
    verticalAlign: "top",
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1),
    height: 120,
    backgroundColor: !isCurrentMonth ? theme.palette.grey[50] : theme.palette.common.white,
    ...(isToday && {
      border: `2px solid ${theme.palette.primary.main}`,
    }),
  })
);

// Dia (número)
const DayNumber = styled("div", {
  shouldForwardProp: (prop) => prop !== "isToday",
})<{ isToday: boolean }>(({ theme, isToday }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(0.5),
  ...(isToday && {
    color: theme.palette.primary.main,
  }),
}));

// Pequenos "chips" de evento
const EventChip = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
  borderRadius: 4,
  padding: "2px 6px",
  marginBottom: theme.spacing(0.5),
  fontSize: "0.75rem",
}));

export default function CustomCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Limites do mês atual
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Início/fim do calendário (semana começa em DOM)
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

  // Monta array bidimensional de datas (cada subarray é uma semana)
  const dayMatrix = [];
  let tempDate = calendarStart;
  while (tempDate <= calendarEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(tempDate);
      tempDate = addDays(tempDate, 1);
    }
    dayMatrix.push(week);
  }

  const weekDays = ["DOM.", "SEG.", "TER.", "QUA.", "QUI.", "SEX.", "SÁB."];

  const getEventsForDay = (day: Date) =>
    sampleEvents.filter(
      (event) => format(event.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    );

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ flexGrow: 1, my: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {/* Barra de navegação de meses */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Button variant="outlined" onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}>
              Mês Anterior
            </Button>
            <Typography variant="h5" component="div">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </Typography>
            <Button variant="outlined" onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}>
              Próximo Mês
            </Button>
          </Box>

          {/* Tabela principal do calendário */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {weekDays.map((dayName) => (
                    <HeaderCell key={dayName}>{dayName}</HeaderCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dayMatrix.map((week, wIndex) => (
                  <TableRow key={wIndex}>
                    {week.map((day, dIndex) => {
                      const isCurrent = day.getMonth() === currentMonth.getMonth();
                      return (
                        <DayCell
                          key={dIndex}
                          isCurrentMonth={isCurrent}
                          isToday={isToday(day)}
                        >
                          <DayNumber isToday={isToday(day)}>
                            {format(day, "d")}
                          </DayNumber>

                          {getEventsForDay(day).map((evt, i) => (
                            <EventChip key={i}>
                              {format(evt.date, "p", { locale: ptBR })} {evt.title}
                            </EventChip>
                          ))}
                        </DayCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      <Box
        component="footer"
        sx={{ py: 2, textAlign: "center", bgcolor: "background.paper" }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Meu Calendário Personalizado
        </Typography>
      </Box>
    </>
  );
}
