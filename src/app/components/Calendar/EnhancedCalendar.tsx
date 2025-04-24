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
import { CalendarEvent } from "@/app/components/Calendar/types";
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
import { useApi } from "@/app/hooks/useApi";

/* ---------- helpers ---------- */
const toLocalDate = (isoUtcZ: string) => new Date(isoUtcZ.replace(/Z$/, ""));
const hueFor = (s: string) =>
  `hsl(${[...s].reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0) % 360},65%,50%)`;
const rangeFor = (v: "month" | "week" | "day", ref: Date) =>
  v === "month"
    ? {
        start: format(startOfWeek(startOfMonth(ref)), "yyyy-MM-dd"),
        end: format(endOfWeek(endOfMonth(ref)), "yyyy-MM-dd"),
      }
    : v === "week"
    ? {
        start: format(startOfWeek(ref), "yyyy-MM-dd"),
        end: format(endOfWeek(ref), "yyyy-MM-dd"),
      }
    : { start: format(ref, "yyyy-MM-dd"), end: format(ref, "yyyy-MM-dd") };

/* ---------- tipos auxiliares ---------- */
type CollegeLocation = { id: number; name: string };
type SimpleSpec = { id: number; name: string };

export default function EnhancedCalendar({
  showScheduleButton,
}: {
  showScheduleButton: boolean;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [campusFilters, setCampusFilters] = useState<string[]>([]);
  const [specFilters, setSpecFilters] = useState<string[]>([]);
  const pushWithProgress = usePushWithProgress();

  /* listas estáticas */
  const { data: campusApi } = useApi<CollegeLocation[]>("/api/college_locations");
  const campusStatic = (campusApi || []).map((c) => c.name);

  const { data: specApi } = useApi<SimpleSpec[]>("/api/specialties/simple");
  const specialtyStatic = (specApi || []).map((s) => s.name);

  /* eventos */
  const { start, end } = rangeFor(view, currentDate);
  const { data: calApi, loading } = useApi<{ free: any[]; busy: any[] }>(
    `/api/calendar?start=${start}&end=${end}`
  );

  const [events, campusDyn, specDyn, colorMap] = useMemo(() => {
    if (!calApi) return [[], [], [], {}] as any;

    const campusSet = new Set<string>();
    const specSet = new Set<string>();
    const ev: CalendarEvent[] = [];

    const pushEv = (o: any, kind: "free" | "busy") => {
      const date = toLocalDate(o.start_at);
      campusSet.add(o.campus_name);
      specSet.add(o.specialty_name);

      ev.push({
        id: `${kind}-${o.id}-${date.toISOString()}`,
        date,
        title: kind === "busy" ? o.patient_name || "Consulta" : "Disponível",
        description: `${o.specialty_name} • ${o.campus_name}`,
        category: o.specialty_name,
        /* ---------- PROPS para diálogo ---------- */
        isRecurring: Boolean(o.time_slot_id),
        timeSlotId: o.time_slot_id,
      } as any);
    };

    calApi.free.forEach((f) => pushEv(f, "free"));
    calApi.busy.forEach((b) => pushEv(b, "busy"));

    const map: Record<string, { color: string }> = {};
    Array.from(specSet).forEach((s) => (map[s] = { color: hueFor(s) }));

    return [ev, Array.from(campusSet), Array.from(specSet), map];
  }, [calApi]);

  const campusList = [...new Set([...campusStatic, ...campusDyn])];
  const specialtyList = [...new Set([...specialtyStatic, ...specDyn])];

  /* filtros */
  const filteredEvents = events.filter((e) => {
    const campusOk =
      campusFilters.length === 0 ||
      campusFilters.some((c) => e.description?.includes(c));
    const specOk = specFilters.length === 0 || specFilters.includes(e.category);
    return campusOk && specOk;
  });

  /* navegação helpers */
  const prev = () =>
    setCurrentDate(
      view === "month"
        ? subMonths(currentDate, 1)
        : addDays(currentDate, view === "week" ? -7 : -1)
    );
  const next = () =>
    setCurrentDate(
      view === "month"
        ? addMonths(currentDate, 1)
        : addDays(currentDate, view === "week" ? 7 : 1)
    );

  /* view renderer */
  const viewProps = { events: filteredEvents, categoryConfig: colorMap, onRefresh: () => window.location.reload() } as any;
  const body =
    view === "month" ? (
      <CalendarMonthView currentMonth={currentDate} {...viewProps} />
    ) : view === "week" ? (
      <CalendarWeekView referenceDate={currentDate} {...viewProps} />
    ) : (
      <CalendarDayView referenceDate={currentDate} {...viewProps} />
    );

  const dateLabel =
    view === "month"
      ? format(currentDate, "MMMM yyyy", { locale: ptBR })
      : view === "week"
      ? `Semana ${format(startOfWeek(currentDate), "dd/MM", { locale: ptBR })}-${format(
          endOfWeek(currentDate),
          "dd/MM",
          { locale: ptBR }
        )}`
      : format(currentDate, "dd 'de' MMMM yyyy", { locale: ptBR });

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <CssBaseline />

      <Paper sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <CalendarHeader
          title="Calendário"
          viewMode={view}
          dateDisplay={dateLabel}
          onPrev={prev}
          onNext={next}
          onToday={() => setCurrentDate(new Date())}
          onViewModeChange={setView}
          campusList={campusList}
          specialtyList={specialtyList}
          campusFilters={campusFilters}
          specialtyFilters={specFilters}
          onToggleCampus={(c) =>
            setCampusFilters((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))
          }
          onToggleSpecialty={(s) =>
            setSpecFilters((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))
          }
          onClearFilters={() => {
            setCampusFilters([]);
            setSpecFilters([]);
          }}
          showScheduleButton={showScheduleButton}
          onScheduleClick={() => pushWithProgress("calendario/agendamento")}
        />

        <Box sx={{ flex: 1, position: "relative" }}>
          {loading ? (
            <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Carregando…</Typography>
            </Box>
          ) : (
            body
          )}
        </Box>
      </Paper>

      <Fab color="primary" sx={{ position: "fixed", bottom: 16, right: 16, display: { xs: "flex", md: "none" } }}>
        <AddIcon />
      </Fab>
    </Box>
  );
}
