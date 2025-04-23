"use client";

import React, { useEffect } from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Stack,
  Skeleton,
} from "@mui/material";
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApi } from "@/app/hooks/useApi";
import { CollegeLocation, Specialty } from "./types";

/* ─────────────────────────── constantes ─────────────────────────── */
const weekDays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

/* ─────────────────────────────  Zod  ────────────────────────────── */
const timeSchema = z
  .object({
    start_time: z.any(),
    end_time: z.any(),
  })
  .refine((t) => dayjs(t.end_time).isAfter(dayjs(t.start_time)), {
    message: "Hora fim deve ser maior que início",
    path: ["end_time"],
  });

const scheduleSchema = z.object({
  date: z.date().optional(),
  week_day: z.coerce.number().optional(),
  times: z.array(timeSchema).min(1, "Inclua pelo menos um intervalo"),
});

const formSchema = z
  .object({
    college_location_id: z.coerce.number().optional(),
    specialty_id: z.coerce.number().optional(),
    repeat_type: z.coerce.number(), // 0 = data | 1 = semanal
    schedules: z.array(scheduleSchema).min(1),
  })
  .refine((d) => d.college_location_id != null, {
    path: ["college_location_id"],
    message: "Selecione o local",
  })
  .refine((d) => d.specialty_id != null, {
    path: ["specialty_id"],
    message: "Selecione a especialidade",
  })
  .refine(
    (d) =>
      d.repeat_type === 0
        ? d.schedules.every((s) => s.date)
        : d.schedules.every((s) => s.week_day != null),
    {
      path: ["schedules"],
      message: "Preencha Data ou Dia da Semana",
    }
  );

type FormValues = z.infer<typeof formSchema>;

/* ────────────────── componente filho: ScheduleItem ───────────────── */
interface ScheduleItemProps {
  control: ReturnType<typeof useForm<FormValues>>["control"];
  scheduleIndex: number;
  repeatType: number;
  removeDay: () => void;
  disableRemoveDay: boolean;
}

function ScheduleItem({
  control,
  scheduleIndex: sIdx,
  repeatType,
  removeDay,
  disableRemoveDay,
}: ScheduleItemProps) {
  /* fieldArray para times (intervalos) */
  const {
    fields: timeFields,
    append: appendTime,
    remove: removeTime,
  } = useFieldArray({ control, name: `schedules.${sIdx}.times` });

  /* helper para erros aninhados */
  const errTime = (tIdx: number, key: "start_time" | "end_time") =>
    (control._formState.errors.schedules?.[sIdx]?.times?.[tIdx] as any)?.[key];

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      {/* cabeçalho: Data/Dia + 1º intervalo + ícones */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", sm: "240px 1fr auto auto" }}
        gap={2}
        alignItems="center"
        mb={timeFields.length ? 2 : 0}
      >
        {repeatType === 1 ? (
          /* ---------- Dia da semana ---------- */
          <Controller
            key={`week-${sIdx}`}
            name={`schedules.${sIdx}.week_day`}
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                select
                fullWidth
                label="Dia da Semana"
                name={field.name}
                inputRef={field.ref}
                value={field.value ?? ""}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(+e.target.value)}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {weekDays.map((d) => (
                  <MenuItem key={d.value} value={d.value}>
                    {d.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        ) : (
          /* ---------- Data específica ---------- */
          <Controller
            key={`date-${sIdx}`}
            name={`schedules.${sIdx}.date`}
            control={control}
            render={({ field, fieldState }) => (
              <DatePicker
                label="Data"
                value={field.value ? dayjs(field.value) : null}
                onChange={(d) => field.onChange(d?.toDate() || undefined)}
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
        )}

        {/* primeiro intervalo */}
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr 1fr auto" }}
          gap={2}
          alignItems="center"
        >
          <Controller
            name={`schedules.${sIdx}.times.0.start_time`}
            control={control}
            render={({ field }) => (
              <TimePicker
                label="Início" {...field}
                slotProps={{
                  textField: {
                    error: !!errTime(0, "start_time"),
                    helperText: errTime(0, "start_time")?.message,
                  },
                }}
              />
            )}
          />

          <Controller
            name={`schedules.${sIdx}.times.0.end_time`}
            control={control}
            render={({ field }) => (
              <TimePicker
                label="Fim" {...field}
                slotProps={{
                  textField: {
                    error: !!errTime(0, "end_time"),
                    helperText: errTime(0, "end_time")?.message,
                  },
                }}
              />
            )}
          />

          {/* ⬇️  espaço para manter alinhamento */}
          <span />
        </Box>

        {/* + intervalo */}
        <IconButton
          size="small"
          sx={{ p: 0.5 }}
          aria-label="Adicionar intervalo"
          onClick={() =>
            appendTime({
              start_time: dayjs().hour(9).minute(0),
              end_time: dayjs().hour(10).minute(0),
            })
          }
        >
          <AddIcon fontSize="small" />
        </IconButton>

        {/* remover dia */}
        <IconButton
          size="small"
          aria-label="Remover dia"
          disabled={disableRemoveDay}
          onClick={removeDay}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* intervalos extra */}
      {timeFields.slice(1).length > 0 && (
        <Stack spacing={2}>
          {timeFields.slice(1).map((t, idx) => {
            const realIdx = idx + 1;
            return (
              <Box
                key={t.id}
                display="grid"
                gridTemplateColumns={{ xs: "1fr 1fr auto" }}
                gap={2}
                alignItems="center"
              >
                <Controller
                  name={`schedules.${sIdx}.times.${realIdx}.start_time`}
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      label="Início" {...field}
                      slotProps={{
                        textField: {
                          error: !!errTime(realIdx, "start_time"),
                          helperText: errTime(realIdx, "start_time")?.message,
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name={`schedules.${sIdx}.times.${realIdx}.end_time`}
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      label="Fim" {...field}
                      slotProps={{
                        textField: {
                          error: !!errTime(realIdx, "end_time"),
                          helperText: errTime(realIdx, "end_time")?.message,
                        },
                      }}
                    />
                  )}
                />

                <IconButton
                  size="small"
                  aria-label="Remover intervalo"
                  onClick={() => removeTime(realIdx)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

/* ────────────────────────────────────────────────────────────────── */
export default function ScheduleForm() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repeat_type: 0,
      schedules: [
        {
          date: dayjs().toDate(),
          times: [
            {
              start_time: dayjs().hour(9),
              end_time: dayjs().hour(10),
            },
          ],
        },
      ],
    },
  });

  /* campus/especialidade carregamento -------------------------------- */
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

  /* schedules FieldArray (somente aqui!) ----------------------------- */
  const {
    fields: scheduleFields,
    append: appendSchedule,
    remove: removeSchedule,
  } = useFieldArray({ control, name: "schedules" });

  /* mantém date/week_day coerentes quando troca repeat_type ---------- */
  const repeatType = watch("repeat_type");
  useEffect(() => {
    scheduleFields.forEach((_, idx) => {
      if (repeatType === 1) {
        const d = getValues(`schedules.${idx}.date`);
        setValue(`schedules.${idx}.week_day`, d ? dayjs(d).day() : dayjs().day());
        setValue(`schedules.${idx}.date`, undefined);
      } else {
        const wd = getValues(`schedules.${idx}.week_day`);
        setValue(`schedules.${idx}.date`, dayjs().day(wd ?? 0).toDate());
        setValue(`schedules.${idx}.week_day`, undefined);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatType]);

  /* submit ----------------------------------------------------------- */
  const onSubmit = (data: FormValues) => {
    const base = {
      college_location_id: data.college_location_id!,
      specialty_id: data.specialty_id!,
      repeat_type: data.repeat_type,
    };

    const payload = data.schedules.flatMap((s) =>
      s.times.map((t) => ({
        ...base,
        date: s.date ? dayjs(s.date).format("YYYY-MM-DD") : undefined,
        week_day: s.week_day,
        start_time: dayjs(t.start_time).format("HH:mm"),
        end_time: dayjs(t.end_time).format("HH:mm"),
      }))
    );

    console.log("Payload:", payload);
  };

  /* ----------------------------------------------------------------- */
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

        <Paper elevation={3} sx={{ p: 4 }}>
          {/* campus + especialidade */}
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "repeat(2,1fr)" }} gap={2} mb={3}>
            {/* campus */}
            {loadingLocs ? (
              <Skeleton height={56} />
            ) : (
              <Controller
                name="college_location_id"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    select label="Campus" fullWidth {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(+e.target.value)}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {locations.map((l) => (
                      <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
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
                    select label="Especialidade" fullWidth {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(+e.target.value)}
                    disabled={!selectedCampusId}
                    error={!!fieldState.error}
                    helperText={
                      !selectedCampusId ? "Selecione o campus primeiro" : fieldState.error?.message
                    }
                  >
                    {specialties.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}
          </Box>

          {/* repetição */}
          <Box mb={4} maxWidth={{ xs: "100%", sm: 300 }}>
            <Controller
              name="repeat_type"
              control={control}
              render={({ field }) => (
                <TextField
                  select label="Repetição" fullWidth {...field}
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
            {scheduleFields.map((sched, idx) => (
              <ScheduleItem
                key={sched.id}
                control={control}
                scheduleIndex={idx}
                repeatType={repeatType}
                removeDay={() => removeSchedule(idx)}
                disableRemoveDay={scheduleFields.length === 1}
              />
            ))}
          </Stack>

          {/* botões finais */}
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

            <Button variant="contained" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
