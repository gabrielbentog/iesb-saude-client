// EnhancedCalendar.tsx
import React, { useState, useMemo } from "react";
import { Box, CssBaseline, Paper, Fab } from "@mui/material";
import { format, addDays, subMonths, addMonths, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import AddIcon from "@mui/icons-material/Add";

import { CalendarHeader } from "./CalendarHeader";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarWeekView } from "./CalendarWeekView";
import { CalendarDayView } from "./CalendarDayView";
import { EventCategory, CalendarEvent } from "@/app/types/calendar";

const categoryConfig: Record<EventCategory, { color: string; icon: React.ReactNode }> = {
  medical: { color: "#E50839", icon: <span>Médico</span> },
  training: { color: "#2196F3", icon: <span>Treinamento</span> },
  work: { color: "#4CAF50", icon: <span>Trabalho</span> },
  holiday: { color: "#FF9800", icon: <span>Feriado</span> },
};

// Eventos de exemplo
const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    date: new Date(2025, 2, 19, 13, 0),
    title: "Plantão Ambulatório",
    description: "Plantão regular no ambulatório da Ala B",
    location: "Ambulatório - Ala B",
    category: "work",
  },
  {
    id: "2",
    date: new Date(2025, 2, 20, 9, 0),
    title: "Treinamento de Emergência",
    description: "Treinamento obrigatório sobre novos protocolos",
    location: "Sala de Treinamento 3",
    category: "training",
  },
  // outros eventos...
];

export default function EnhancedCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [activeFilters, setActiveFilters] = useState<EventCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Funções de navegação
  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    if (viewMode === "week") setCurrentDate(addDays(currentDate, -7));
    if (viewMode === "day") setCurrentDate(addDays(currentDate, -1));
  };

  const handleNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    if (viewMode === "week") setCurrentDate(addDays(currentDate, 7));
    if (viewMode === "day") setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  // Funções de filtros
  const handleFilterClick = (e: React.MouseEvent<HTMLElement>) => setFilterAnchorEl(e.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);
  const handleFilterToggle = (category: EventCategory) =>
    setActiveFilters((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  const handleClearFilters = () => {
    setActiveFilters([]);
    setFilterAnchorEl(null);
  };

  // Função de busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  // Filtra eventos
  const filteredEvents = useMemo(() => {
    return sampleEvents.filter((event) => {
      const matchesFilter = activeFilters.length === 0 || activeFilters.includes(event.category);
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        event.title.toLowerCase().includes(lowerSearch) ||
        (event.description && event.description.toLowerCase().includes(lowerSearch));
      return matchesFilter && matchesSearch;
    });
  }, [activeFilters, searchTerm]);

  // Seleciona qual view renderizar
  let calendarContent = null;
  if (viewMode === "month") {
    calendarContent = (
      <CalendarMonthView
        currentMonth={currentDate}
        events={filteredEvents}
        categoryConfig={categoryConfig}
      />
    );
  } else if (viewMode === "week") {
    calendarContent = (
      <CalendarWeekView
        referenceDate={currentDate}
        events={filteredEvents}
        categoryConfig={categoryConfig}
      />
    );
  } else if (viewMode === "day") {
    calendarContent = (
      <CalendarDayView
        referenceDate={currentDate}
        events={filteredEvents}
        categoryConfig={categoryConfig}
      />
    );
  }

  const dateDisplay =
    viewMode === "month"
      ? format(currentDate, "MMMM yyyy", { locale: ptBR })
      : viewMode === "week"
      ? `Semana de ${format(startOfWeek(currentDate), "dd/MM", { locale: ptBR })} a ${format(
          endOfWeek(currentDate),
          "dd/MM",
          { locale: ptBR }
        )}`
      : format(currentDate, "dd 'de' MMMM yyyy", { locale: ptBR });

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Paper elevation={3} sx={{ borderRadius: 0, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
          <CalendarHeader
            title="Calendário"
            viewMode={viewMode}
            dateDisplay={dateDisplay}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
            onViewModeChange={setViewMode}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onClearSearch={() => setSearchTerm("")}
            filterAnchorEl={filterAnchorEl}
            onFilterClick={handleFilterClick}
            onFilterClose={handleFilterClose}
            activeFilters={activeFilters}
            onFilterToggle={handleFilterToggle}
            onClearFilters={handleClearFilters}
            categoryConfig={categoryConfig}
          />
          <Box sx={{ flex: 1, overflow: "auto" }}>{calendarContent}</Box>
        </Paper>
      </Box>
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 16, display: { xs: "flex", md: "none" } }}
        aria-label="Novo evento"
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
