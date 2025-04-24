// EnhancedCalendar.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  CssBaseline,
  Paper,
  Fab,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  format,
  addDays,
  subMonths,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import AddIcon from "@mui/icons-material/Add";

import { CalendarHeader } from "./CalendarHeader";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarWeekView } from "./CalendarWeekView";
import { CalendarDayView } from "./CalendarDayView";
import {
  EventCategory,
  CalendarEvent,
} from "@/app/components/Calendar/types";
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
import { useApi } from "@/app/hooks/useApi";

// ---------- categorias ----------
type ExtendedCategory = EventCategory | "free" | "busy";

const categoryConfig: Record<
  ExtendedCategory,
  { color: string; icon: React.ReactNode }
> = {
  medical: { color: "#E50839", icon: <span>Médico</span> },
  training: { color: "#2196F3", icon: <span>Treinamento</span> },
  work: { color: "#4CAF50", icon: <span>Trabalho</span> },
  holiday: { color: "#FF9800", icon: <span>Feriado</span> },
  free: { color: "#9E9E9E", icon: <span>Disponível</span> },
  busy: { color: "#8E24AA", icon: <span>Agendado</span> },
};

// ---------- helper para montar URL ----------
function rangeFor(viewMode: "month" | "week" | "day", ref: Date) {
  switch (viewMode) {
    case "month":
      return {
        start: format(startOfWeek(startOfMonth(ref)), "yyyy-MM-dd"),
        end: format(endOfWeek(endOfMonth(ref)), "yyyy-MM-dd"),
      };
    case "week":
      return {
        start: format(startOfWeek(ref), "yyyy-MM-dd"),
        end: format(endOfWeek(ref), "yyyy-MM-dd"),
      };
    case "day":
    default:
      return {
        start: format(ref, "yyyy-MM-dd"),
        end: format(ref, "yyyy-MM-dd"),
      };
  }
}

// ---------- converte "2025-04-07T08:05:00.000Z" → Date local ----------
const toLocalDate = (isoUtcZ: string) => {
  // remove o "Z" final para que o construtor use o timezone do navegador
  const localIso = isoUtcZ.replace(/Z$/, "");
  return new Date(localIso);
};

export default function EnhancedCalendar({
  showScheduleButton,
}: {
  showScheduleButton: boolean;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [activeFilters, setActiveFilters] = useState<ExtendedCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const pushWithProgress = usePushWithProgress();

  // ----- busca dinâmica -----
  const { start, end } = rangeFor(viewMode, currentDate);
  const { data: apiData, loading } = useApi<{
    free: any[];
    busy: any[];
  }>(`/api/calendar?start=${start}&end=${end}`);

  // ----- converte payload → CalendarEvent[] -----
  const eventsFromApi: CalendarEvent[] = useMemo(() => {
    if (!apiData) return [];

    const freeEv = apiData.free.map(
      ({ start_at, time_slot_id, campus_name, specialty_name }): CalendarEvent => ({
        id: `free-${time_slot_id}-${start_at}`,
        date: toLocalDate(start_at),
        title: "Disponível",
        description: `${specialty_name} • ${campus_name}`,
        category: "free",
      })
    );

    const busyEv = apiData.busy.map(
      ({ appointment_id, start_at, patient_name, specialty_name, campus_name }): CalendarEvent => ({
        id: `busy-${appointment_id}`,
        date: toLocalDate(start_at),
        title: patient_name || "Consulta",
        description: `${specialty_name} • ${campus_name}`,
        category: "busy",
      })
    );

    return [...freeEv, ...busyEv];
  }, [apiData]);

  // ----- filtros/busca -----
  const filteredEvents = useMemo(() => {
    return eventsFromApi.filter((event) => {
      const matchesFilter =
        activeFilters.length === 0 || activeFilters.includes(event.category as ExtendedCategory);
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        event.title.toLowerCase().includes(lowerSearch) ||
        (event.description && event.description.toLowerCase().includes(lowerSearch));
      return matchesFilter && matchesSearch;
    });
  }, [eventsFromApi, activeFilters, searchTerm]);

  // ----- navegação -----
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

  // ----- filtros UI -----
  const handleFilterClick = (e: React.MouseEvent<HTMLElement>) => setFilterAnchorEl(e.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);
  const handleFilterToggle = (category: ExtendedCategory) =>
    setActiveFilters((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  const handleClearFilters = () => {
    setActiveFilters([]);
    setFilterAnchorEl(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  // ----- view escolhida -----
  let calendarContent: React.ReactNode = null;
  if (viewMode === "month") {
    calendarContent = (
      <CalendarMonthView currentMonth={currentDate} events={filteredEvents} categoryConfig={categoryConfig} />
    );
  } else if (viewMode === "week") {
    calendarContent = (
      <CalendarWeekView referenceDate={currentDate} events={filteredEvents} categoryConfig={categoryConfig} />
    );
  } else if (viewMode === "day") {
    calendarContent = (
      <CalendarDayView referenceDate={currentDate} events={filteredEvents} categoryConfig={categoryConfig} />
    );
  }

  const dateDisplay =
    viewMode === "month"
      ? format(currentDate, "MMMM yyyy", { locale: ptBR })
      : viewMode === "week"
      ? `Semana de ${format(startOfWeek(currentDate), "dd/MM", { locale: ptBR })} a ${format(endOfWeek(currentDate), "dd/MM", { locale: ptBR })}`
      : format(currentDate, "dd 'de' MMMM yyyy", { locale: ptBR });

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <CssBaseline />

      <Paper elevation={3} sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 0 }}>
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
          showScheduleButton={showScheduleButton}
          onScheduleClick={() => pushWithProgress("calendario/agendamento")}
        />

        <Box sx={{ flex: 1, overflow: "auto", position: "relative" }}>
          {loading ? (
            <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Carregando horários…</Typography>
            </Box>
          ) : (
            calendarContent
          )}
        </Box>
      </Paper>

      <Fab color="primary" sx={{ position: "fixed", bottom: 16, right: 16, display: { xs: "flex", md: "none" } }} aria-label="Novo evento">
        <AddIcon />
      </Fab>
    </Box>
  );
}
