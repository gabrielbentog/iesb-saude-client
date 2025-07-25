/* pages/gestor/calendario/agendamento/ScheduleFormPage.tsx  */

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
import "dayjs/locale/pt-br"; // Importe o locale português do Brasil

dayjs.locale("pt-br");

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray } from "react-hook-form";

import { useScheduleForm } from "@/app/hooks/useScheduleForm";
import { ScheduleItem } from "@/app/components/agendamento/ScheduleItem";

import { useApi } from "@/app/hooks/useApi";
import { apiFetch } from "@/app/lib/api";
import { CollegeLocation } from "@/app/types";
import { FormValues } from "@/app/components/agendamento/schemas";
import { ptBR } from "@mui/x-date-pickers/locales";
import type { ApiResponse } from '@/app/types';
import { useToast } from "@/app/contexts/ToastContext";

// Defina um tipo para a resposta da API que inclui a propriedade 'data'

export default function ScheduleFormPage() {
  const router = useRouter();
  const { showToast } = useToast();

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

  /* ---------- selects ---------- */
  // Modificado para esperar ApiResponse contendo CollegeLocation[]
  const { data: locResponse, loading: loadingLocs } =
    useApi<ApiResponse<CollegeLocation[]>>("/api/college_locations");

  const locations = locResponse?.data ?? [];

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
    scheduleFields.forEach((field, idx) => {
      if (repeatType === 1) {
        const currentWeekDay = getValues(`schedules.${idx}.week_day`);
        const currentDate = getValues(`schedules.${idx}.date`);
        if (currentWeekDay === undefined && currentDate) {
          setValue(`schedules.${idx}.week_day`, dayjs(currentDate).day());
          setValue(`schedules.${idx}.date`, undefined);
        }
      } else {
        const currentWeekDay = getValues(`schedules.${idx}.week_day`);
        const currentDate = getValues(`schedules.${idx}.date`);
        if (currentDate === undefined && currentWeekDay !== undefined) {
          setValue(`schedules.${idx}.date`, dayjs().day(currentWeekDay).toDate());
          setValue(`schedules.${idx}.week_day`, undefined);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatType]);

  /* ---------- submit ---------- */
  const onSubmit = async (data: FormValues) => {
    const recurrenceRuleAttributes =
      data.repeat_type === 1
        ? {
            frequencyType: data.repeat_type,
            startDate: dayjs(data.period_start!).format("YYYY-MM-DD"),
            endDate:   dayjs(data.period_end!).format("YYYY-MM-DD"),
          }
        : undefined;

    const base = {
      collegeLocationId: data.college_location_id,
      ...(recurrenceRuleAttributes && { recurrenceRuleAttributes }),
    };

    const payload = data.schedules.flatMap((s) =>
      s.times.map((t) => ({
        ...base,
        date:      s.date ? dayjs(s.date).format("YYYY-MM-DD") : undefined,
        weekDay:   s.week_day,
        startTime: dayjs(t.start_time).format("HH:mm"),
        endTime:   dayjs(t.end_time).format("HH:mm"),
      }))
    );

    try {
      await apiFetch("/api/time_slots", {
        method: "POST",
        body:   JSON.stringify({ time_slots: payload }),
      });
      showToast({
        message: "Horários salvos com sucesso!",
        severity: "success",
      });
      router.push("/gestor/calendario");
    } catch (err) {
      console.error(err);
      showToast({
        message: "Falha ao salvar horários",
        severity: "error",
      });
    }
  };

  /* ---------- UI ---------- */
  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="pt-br"
      localeText={ptBR.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* header */}
        <Stack direction="row" spacing={2} mb={2} alignItems="center">
          <Button startIcon={<ArrowBackIosNewIcon />} onClick={() => router.back()}>
            Voltar
          </Button>
          <Typography variant="h5" fontWeight={600} flexGrow={1}>
            Definir horários
          </Typography>
        </Stack>

        <Paper sx={{ p: { xs: 2, md: 4 } }}>
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
                    onChange={(e) => {
                      field.onChange(e.target.value); // Não converte mais para número
                    }}
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
            {/* repetição */}
            <Controller
              name="repeat_type"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label="Repetição"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(+e.target.value)}
                >
                  <MenuItem value={0}>Não se repete (datas)</MenuItem>
                  <MenuItem value={1}>Repetir semanalmente</MenuItem>
                </TextField>
              )}
            />
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
                    format="DD/MM/YYYY"
                    minDate={dayjs()} // <-- ADICIONE ESTA LINHA
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
                    format="DD/MM/YYYY"
                    minDate={dayjs()} // <-- ADICIONE ESTA LINHA
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

          {/* cards */}
          <Stack spacing={4}>
            {scheduleFields.map((_, idx) => (
              <ScheduleItem
                key={idx} // Idealmente use field.id se disponível e estável
                control={control}
                index={idx}
                repeatType={repeatType}
                onRemoveDay={() => removeSchedule(idx)}
                disableRemoveDay={scheduleFields.length === 1}
              />
            ))}
          </Stack>

          {/* ações */}
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" mt={4} spacing={2}>
            <Button
              sx={{ width: { xs: "100%", sm: "auto" } }}
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() =>
                appendSchedule(
                  repeatType === 1
                    ? {
                        week_day: dayjs().day(), // Usa o dia atual como padrão
                        times: [{ start_time: dayjs().hour(9).minute(0).second(0), end_time: dayjs().hour(10).minute(0).second(0) }],
                      }
                    : {
                        date: dayjs().startOf('day').toDate(), // Usa a data atual como padrão
                        times: [{ start_time: dayjs().hour(9).minute(0).second(0), end_time: dayjs().hour(10).minute(0).second(0) }],
                      }
                )
              }
            >
              Adicionar dia
            </Button>

            <Button
              sx={{ width: { xs: "100%", sm: "auto" } }}
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