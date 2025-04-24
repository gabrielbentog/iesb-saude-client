/*  pages/gestor/calendario/agendamento/ScheduleFormPage.tsx  */
"use client";

import React, { useEffect } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray } from "react-hook-form";

import { useScheduleForm } from "@/app/hooks/useScheduleForm";
import { ScheduleItem } from "@/app/components/agendamento/ScheduleItem";

import { useApi } from "@/app/hooks/useApi";
import { apiFetch } from "@/app/lib/api";
import { CollegeLocation, Specialty } from "./types";
import { FormValues } from "@/app/components/agendamento/schemas";

export default function ScheduleFormPage() {
  const router = useRouter();

  /* ---------- RHF ---------- */
  const methods = useScheduleForm();
  const {
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  /* ---------- selects (mock data) ---------- */
  const { data: locData, loading: loadingLocs } =
    useApi<CollegeLocation[]>("/api/college_locations");
  const locations = locData ?? [];

  const selectedCampusId = watch("college_location_id");
  const { data: specData, loading: loadingSpecs } = useApi<Specialty[]>(
    selectedCampusId
      ? `/api/college_locations/${selectedCampusId}/specialties`
      : ""
  );
  const specialties = specData ?? [];

  /* ---------- schedules ---------- */
  const {
    fields: scheduleFields,
    append: appendSchedule,
    remove: removeSchedule,
  } = useFieldArray({
    control,
    name: "schedules",
  });

  /* ---------- week_day <-> date ---------- */
  const repeatType = watch("repeat_type");
  useEffect(() => {
    scheduleFields.forEach((_, idx) => {
      if (repeatType === 1) {
        const d = getValues(`schedules.${idx}.date`);
        setValue(
          `schedules.${idx}.week_day`,
          d ? dayjs(d).day() : dayjs().day()
        );
        setValue(`schedules.${idx}.date`, undefined);
      } else {
        const wd = getValues(`schedules.${idx}.week_day`);
        setValue(`schedules.${idx}.date`, dayjs().day(wd ?? 0).toDate());
        setValue(`schedules.${idx}.week_day`, undefined);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatType, scheduleFields]);

  /* ---------- submit ---------- */
  const onSubmit = async (data: FormValues) => {
    const recurrenceRuleAttributes =
      data.repeat_type === 1
        ? {
            frequencyType: data.repeat_type,
            startDate:  dayjs(data.period_start!).format("YYYY-MM-DD"),
            endDate:    dayjs(data.period_end!).format("YYYY-MM-DD"),
          }
        : { frequencyType: data.repeat_type };
  
    /** 2. Campos de nível mais alto do formulário */
    const base = {
      collegeLocationId: data.college_location_id,
      specialtyId:        data.specialty_id,
      recurrenceRuleAttributes,
    };
  
    /** 3. Construa o payload normalmente */
    const payload = data.schedules.flatMap((s) =>
      s.times.map((t) => ({
        ...base,
        date:      s.date     ? dayjs(s.date).format("YYYY-MM-DD") : undefined,
        weekDay:  s.week_day,
        startTime: dayjs(t.start_time).format("HH:mm"),
        endTime:   dayjs(t.end_time).format("HH:mm"),
      }))
    );
  
    try {
      await apiFetch("/api/time_slots", {
        method: "POST",
        body:   JSON.stringify({ time_slots: payload }),
      });
      alert("Horários criados com sucesso!");
      router.back();
    } catch (err) {
      console.error(err);
      alert("Falha ao salvar horários");
    }
  };

  /* ---------- UI ---------- */
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* header */}
        <Stack direction="row" spacing={2} mb={2} alignItems="center">
          <Button startIcon={<ArrowBackIosNewIcon />} onClick={() => router.back()}>
            Voltar
          </Button>
          <Typography variant="h5" fontWeight={600} flexGrow={1}>
            Definir horários
          </Typography>
        </Stack>

        <Paper sx={{ p: 4 }}>
          {/* campus + especialidade */}
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "repeat(2,1fr)" }}
            gap={2}
            mb={3}
          >
            {/* campus */}
            {loadingLocs ? (
              <Skeleton height={56} />
            ) : (
              <Controller
                name="college_location_id"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    select
                    fullWidth
                    label="Campus"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(+e.target.value)}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {locations.map((l) => (
                      <MenuItem key={l.id} value={l.id}>
                        {l.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}

            {/* especialidade */}
            {loadingSpecs ? (
              <Skeleton height={56} />
            ) : (
              <Controller
                name="specialty_id"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    select
                    fullWidth
                    label="Especialidade"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(+e.target.value)}
                    disabled={!selectedCampusId}
                    error={!!fieldState.error}
                    helperText={
                      !selectedCampusId
                        ? "Selecione o campus primeiro"
                        : fieldState.error?.message
                    }
                  >
                    {specialties.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}
          </Box>

          {/* período */}
          {repeatType === 1 && (
            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
              gap={2}
              mb={3}
            >
              <Controller
                name="period_start"
                control={control}
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Período – início"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(d) => field.onChange(d?.toDate())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="period_end"
                control={control}
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Período – fim"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(d) => field.onChange(d?.toDate())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                      },
                    }}
                  />
                )}
              />
            </Box>
          )}

          {/* repetição */}
          <Box mb={4} maxWidth={{ xs: "100%", sm: 300 }}>
            <Controller
              name="repeat_type"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label="Repetição"
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(+e.target.value)}
                >
                  <MenuItem value={0}>Não se repete (datas)</MenuItem>
                  <MenuItem value={1}>Repetir semanalmente</MenuItem>
                </TextField>
              )}
            />
          </Box>

          {/* cards */}
          <Stack spacing={4}>
            {scheduleFields.map((_, idx) => (
              <ScheduleItem
                key={idx}
                control={control}
                index={idx}
                repeatType={repeatType}
                onRemoveDay={() => removeSchedule(idx)}
                disableRemoveDay={scheduleFields.length === 1}
              />
            ))}
          </Stack>

          {/* ações */}
          <Stack direction="row" justifyContent="space-between" mt={4} spacing={2}>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() =>
                appendSchedule(
                  repeatType === 1
                    ? {
                        week_day: dayjs().day(),
                        times: [{ start_time: dayjs().hour(9), end_time: dayjs().hour(10) }],
                      }
                    : {
                        date: dayjs().toDate(),
                        times: [{ start_time: dayjs().hour(9), end_time: dayjs().hour(10) }],
                      }
                )
              }
            >
              Adicionar dia
            </Button>

            <Button
              variant="contained"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
