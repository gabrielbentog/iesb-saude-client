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
import { EventDetailDialog } from "./EventDetailDialog"; // For non-patient actions or busy slots
import { BookingDialog } from "./BookingDialog"; // New dialog for patients
import {
  CalendarEvent,
  // EventCategory, // EventCategory might be directly used from types.ts
} from "@/app/components/Calendar/types"; // Ensure this path is correct
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
import { useApi } from "@/app/hooks/useApi";
import { useToast } from "@/app/contexts/ToastContext"; // For booking confirmation

/* ---------- helpers ---------- */
const toLocalDate = (isoUtcZ: string) => new Date(isoUtcZ.replace(/Z$/, ""));
const hueFor = (s: string) =>
  `hsl(${[...s].reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0) % 360},65%,50%)`;
const rangeFor = (v: ViewMode, ref: Date) =>
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

/* ---------- tipos ---------- */
type CollegeLocation = { id: number; name: string };
type SimpleSpec = { id: number; name: string };

type ApiSlot = {
  id: number;
  start_at: string;
  campus_name: string;
  specialty_name: string;
  time_slot_id?: number;
  patient_name?: string;
  is_recurring?: boolean;
};

type CalendarApi = { free: ApiSlot[]; busy: ApiSlot[] };
type ViewMode = "month" | "week" | "day";
type ColorMap = Record<string, { color: string }>;

interface EnhancedCalendarProps {
  showScheduleButton: boolean;
  userProfile?: "paciente" | "gestor" | "estagiario" | string; // Added userProfile prop
}

export default function EnhancedCalendar({
  showScheduleButton,
  userProfile, // Destructure userProfile
}: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [campusFilters, setCampusFilters] = useState<string[]>([]);
  const [specFilters, setSpecFilters] = useState<string[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [colorMap, setColorMap] = useState<ColorMap>({});
  const pushWithProgress = usePushWithProgress();
  const { showToast } = useToast();

  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CalendarEvent | null>(null);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<CalendarEvent | null>(null);

  const { data: campusApi } = useApi<CollegeLocation[]>("/api/college_locations");
  const campusStatic = (campusApi?.data ?? []).map((c) => c.name);

  const { data: specApi } = useApi<SimpleSpec[]>("/api/specialties/simple");
  const specialtyStatic = (specApi?.data ?? []).map((s) => s.name);

  const { start, end } = rangeFor(view, currentDate);
  const { data: calApi, loading } = useApi<CalendarApi>(
    `/api/calendar?start=${start}&end=${end}`
  );

  const [campusDyn, specDyn] = useMemo<[string[], string[]]>(() => {
    if (!calApi) return [[], []];

    const campusSet = new Set<string>();
    const specSet = new Set<string>();
    const raw: CalendarEvent[] = [];
    const cmap: ColorMap = {};

    const pushEv = (slot: ApiSlot, kind: "free" | "busy") => {
      const date = toLocalDate(slot.start_at);
      campusSet.add(slot.campus_name);
      specSet.add(slot.specialty_name);

      raw.push({
        id: `${kind}-${slot.id}-${date.toISOString()}`,
        date,
        title: kind === "busy" ? "Indisponível" : slot.specialty_name,
        description: `${slot.specialty_name} • ${slot.campus_name}`, // Using description for specialty/campus
        location: slot.campus_name, // Explicit location if needed elsewhere
        category: slot.specialty_name,
        isRecurring: slot.is_recurring ?? Boolean(slot.time_slot_id),
        timeSlotId: slot.time_slot_id,
        type: kind, // <-- Set the type here
      });
    };

    calApi.free.forEach((f) => pushEv(f, "free"));
    calApi.busy.forEach((b) => pushEv(b, "busy"));

    Array.from(specSet).forEach((s) => (cmap[s] = { color: hueFor(s) }));

    setEvents(raw);
    setColorMap(cmap);

    return [Array.from(campusSet), Array.from(specSet)];
  }, [calApi]);

  const campusList = [...new Set([...campusStatic, ...campusDyn])];
  const specialtyList = [...new Set([...specialtyStatic, ...specDyn])];

  const filteredEvents = useMemo(
    () =>
      events.filter((e) => {
        const campusOk =
          campusFilters.length === 0 ||
          campusFilters.some((c) => e.description?.includes(c) || e.location?.includes(c));
        const specOk = specFilters.length === 0 || specFilters.includes(e.category);
        return campusOk && specOk;
      }),
    [events, campusFilters, specFilters]
  );

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

  const handleDeleted = (info: { type: "single" | "series"; id?: string; timeSlotId?: number }) => {
    setEvents((prevEvents) =>
      info.type === "single"
        ? prevEvents.filter((ev) => ev.id !== info.id)
        : prevEvents.filter((ev) => ev.timeSlotId !== info.timeSlotId)
    );
    showToast({ message: "Horário/Série excluído(a).", severity: "info" });
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (userProfile === 'paciente' && event.type === 'free') {
      setSelectedSlotForBooking(event); // Abre o BookingDialog
    } else if (event.type !== 'busy') {
      setSelectedEventForDetail(event); // Abre o EventDetailDialog apenas se NÃO for busy
    }
    // Se for busy, não faz nada
  };


  const viewProps = {
    events: filteredEvents,
    categoryConfig: colorMap,
    onEventClick: handleEventClick,
  };

  const body = {
    month: <CalendarMonthView currentMonth={currentDate} {...viewProps} />,
    week:  <CalendarWeekView referenceDate={currentDate} {...viewProps} />,
    day:   <CalendarDayView referenceDate={currentDate} {...viewProps} />,
  }[view];

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
          onScheduleClick={() => pushWithProgress("/gestor/calendario/agendamento")} // Adjusted path to gestor
        />

        <Box sx={{ flex: 1, position: "relative" }}>
          {loading ? (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Carregando…</Typography>
            </Box>
          ) : (
            body
          )}
        </Box>
      </Paper>

      {selectedEventForDetail && (
        <EventDetailDialog
          open={Boolean(selectedEventForDetail)}
          event={selectedEventForDetail}
          onClose={() => setSelectedEventForDetail(null)}
          onDeleted={(info) => {
            handleDeleted(info);
            setSelectedEventForDetail(null);
          }}
        />
      )}

      {selectedSlotForBooking && (
        <BookingDialog
          open={Boolean(selectedSlotForBooking)}
          event={selectedSlotForBooking}
          onClose={() => setSelectedSlotForBooking(null)}
          onSubmitBooking={async (bookingData) => {
            // Here you would typically make an API call to book the appointment
            console.log("Booking Submitted:", bookingData, "for slot:", selectedSlotForBooking);
            // Example:
            // try {
            //   await apiFetch('/api/appointments', {
            //     method: 'POST',
            //     body: JSON.stringify({
            //       slotId: selectedSlotForBooking.id, // or timeSlotId if it's a recurring slot
            //       objective: bookingData.objective,
            //       date: selectedSlotForBooking.date,
            //     }),
            //   });
            //   showToast({ message: "Consulta agendada com sucesso!", severity: "success" });
            //   // Optionally, refetch events here or update local state
            // } catch (error) {
            //   showToast({ message: "Falha ao agendar consulta.", severity: "error" });
            // }
            showToast({ message: "Agendamento solicitado! (Simulação)", severity: "success" });
            setSelectedSlotForBooking(null); // Close dialog
          }}
        />
      )}

      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", md: "none" },
        }}
        onClick={() => {
            if (userProfile === 'paciente') {
                pushWithProgress("/paciente/agendamento");
            } else if (userProfile === 'gestor' && showScheduleButton) {
                 pushWithProgress("/gestor/calendario/agendamento");
            }
            // Add other profiles or default behavior if needed
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}