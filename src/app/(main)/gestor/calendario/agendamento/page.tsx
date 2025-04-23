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

/* ───────────────────────────── */
const weekDays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

/* ─────────────────────────────
 * Zod Schemas
 * ───────────────────────────── */
const scheduleSchema = z
  .object({
    date: z.date().optional(),              // repeat_type = 0
    week_day: z.coerce.number().optional(), // repeat_type = 1
    start_time: z.any(),
    end_time: z.any(),
  })
  .refine((s) => dayjs(s.end_time).isAfter(dayjs(s.start_time)), {
    message: "Hora fim deve ser maior que início",
    path: ["end_time"],
  });

const formSchema = z
  .object({
    college_location_id: z.coerce.number().optional(),
    specialty_id: z.coerce.number().optional(),
    repeat_type: z.coerce.number(), // 0 = não repete | 1 = semanal
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
      message:
        "Preencha Data (sem repetição) ou Dia da Semana (repetição semanal)",
    }
  );

type FormValues = z.infer<typeof formSchema>;

/* ─────────────────────────────
 * Componente
 * ───────────────────────────── */
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
          start_time: dayjs().hour(8).minute(0),
          end_time: dayjs().hour(12).minute(0),
        },
      ],
    },
  });

  /* Campus & especialidades */
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

  /* FieldArray */
  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules",
  });

  /* -------- Atualiza date/week_day quando muda repeat_type -------- */
  const repeatType = watch("repeat_type");
  useEffect(() => {
    fields.forEach((_, idx) => {
      if (repeatType === 1) {
        const dateVal = getValues(`schedules.${idx}.date`);
        const derived = dateVal ? dayjs(dateVal).day() : dayjs().day();
        setValue(`schedules.${idx}.week_day`, derived, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue(`schedules.${idx}.date`, undefined, { shouldDirty: true });
      } else {
        const wdVal = getValues(`schedules.${idx}.week_day`);
        const fallbackDate =
          wdVal != null ? dayjs().day(wdVal).toDate() : dayjs().toDate();
        setValue(`schedules.${idx}.date`, fallbackDate, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue(`schedules.${idx}.week_day`, undefined, {
          shouldDirty: true,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatType]);

  /* helper erro aninhado */
  const errSched = (
    i: number,
    k: keyof FormValues["schedules"][number]
  ) =>
    (errors.schedules?.[i] as Record<string, { message: string }>)?.[k];

    const onSubmit = (data: FormValues) => {
      const base = {
        college_location_id: data.college_location_id!,
        specialty_id:        data.specialty_id!,
        repeat_type:         data.repeat_type,
      };
    
      const payload = data.schedules.map((s) => ({
        ...base,
        date:        s.date       ? dayjs(s.date).format("YYYY-MM-DD") : undefined,
        week_day:    s.week_day,
        start_time:  dayjs(s.start_time).format("HH:mm"),
        end_time:    dayjs(s.end_time).format("HH:mm"),
      }));
    
      console.log("Payload:", payload);
    };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Header */}
        <Stack direction="row" spacing={2} mb={2} alignItems="center">
          <Button
            startIcon={<ArrowBackIosNewIcon />}
            variant="outlined"
            onClick={() => router.back()}
          >
            Voltar
          </Button>
          <Typography variant="h5" fontWeight={600} flexGrow={1}>
            Definir horários disponíveis
          </Typography>
        </Stack>

        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Campus + Especialidade */}
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)" }}
            gap={2}
            mb={3}
          >
            {/* CAMPUS -------------------------------------------------- */}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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

            {/* ESPECIALIDADE -------------------------------------------------- */}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!fieldState.error}
                    helperText={
                      !selectedCampusId
                        ? "Selecione o campus primeiro"
                        : fieldState.error?.message
                    }
                    disabled={!selectedCampusId}
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

          {/* Select Repetição */}
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
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  <MenuItem value={0}>Não se repete (datas específicas)</MenuItem>
                  <MenuItem value={1}>Repetir semanalmente</MenuItem>
                </TextField>
              )}
            />
          </Box>

          {/* Horários -------------------------------------------------- */}
          <Stack spacing={4}>
            {fields.map((f, i) => (
              <Paper key={f.id} variant="outlined" sx={{ p: 3 }}>
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", sm: "2fr 2fr 2fr auto" }}
                  gap={2}
                  alignItems="center"
                >
                  {repeatType === 1 ? (
                    /* ---------- Dia da semana ---------- */
                    <Controller
                      key={`week-day-${f.id}`}
                      name={`schedules.${i}.week_day`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          select
                          fullWidth
                          label="Dia da Semana"
                          name={field.name}
                          inputRef={field.ref}
                          value={field.value ?? ""}                 // ← nunca undefined
                          onBlur={field.onBlur}
                          onChange={e => field.onChange(+e.target.value)}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        >
                          {weekDays.map(d => (
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
                      key={`date-${f.id}`}            // ← chave exclusiva!
                      name={`schedules.${i}.date`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <DatePicker
                          label="Data"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(d) =>
                            field.onChange(d?.toDate() || undefined)
                          }
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

                  {/* Início -------------------------------------------------- */}
                  <Controller
                    key={`start-time-${f.id}`}            // ← chave exclusiva!
                    name={`schedules.${i}.start_time`}
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        label="Início"
                        {...field}
                        slotProps={{
                          textField: {
                            error: !!errSched(i, "start_time"),
                            helperText: errSched(i, "start_time")?.message,
                          },
                        }}
                      />
                    )}
                  />

                  {/* Fim -------------------------------------------------- */}
                  <Controller
                    key={`end-time-${f.id}`}            // ← chave exclusiva!
                    name={`schedules.${i}.end_time`}
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        label="Fim"
                        {...field}
                        slotProps={{
                          textField: {
                            error: !!errSched(i, "end_time"),
                            helperText: errSched(i, "end_time")?.message,
                          },
                        }}
                      />
                    )}
                  />

                  {/* Remover horário --------------------------------------- */}
                  <IconButton
                    aria-label="Remover horário"
                    disabled={fields.length === 1}
                    onClick={() => remove(i)}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>

          {/* Botões ------------------------------------------------------ */}
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={2}
            mt={4}
          >
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() =>
                append(
                  repeatType === 1
                    ? {
                        week_day: dayjs().day(),
                        start_time: dayjs().hour(8).minute(0),
                        end_time: dayjs().hour(12).minute(0),
                      }
                    : {
                        date: dayjs().toDate(),
                        start_time: dayjs().hour(8).minute(0),
                        end_time: dayjs().hour(12).minute(0),
                      }
                )
              }
            >
              Adicionar horário
            </Button>

            <Button
              variant="contained"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              {isSubmitting ? "Salvando..." : "Salvar Alocações"}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
