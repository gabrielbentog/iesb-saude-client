"use client";

import React from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  TimePicker,
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";

/* ──────────────────────────────────────────────────────────
 * Mock de dados
 * ────────────────────────────────────────────────────────── */
const weekDays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

const turnOptions = [
  { value: 0, label: "Manhã" },
  { value: 1, label: "Tarde" },
  { value: 2, label: "Noite" },
];

const frequencyTypes = [
  { value: 0, label: "Diária" },
  { value: 1, label: "Semanal" },
  { value: 2, label: "Mensal" },
];

const locations = [{ id: 1, name: "Unidade Central" }];
const specialties = [{ id: 1, name: "Nutrição" }];

/* ──────────────────────────────────────────────────────────
 * Zod Schemas (com coerção)
 * ────────────────────────────────────────────────────────── */
const recurrenceSchema = z.object({
  start_date: z.date({ required_error: "Informe a data inicial" }),
  end_date: z.date({ required_error: "Informe a data final" }),
  frequency_type: z.coerce.number({ required_error: "Informe a frequência" }),
  frequency_interval: z.coerce
    .number({ invalid_type_error: "Somente números" })
    .int()
    .min(1, { message: "Mínimo 1" }),
  max_occurrences: z.coerce.number().optional(),
});

const scheduleSchema = z.object({
  week_day: z.coerce.number({ required_error: "Escolha o dia" }),
  turn: z.coerce.number({ required_error: "Escolha o turno" }),
  start_time: z.any(),
  end_time: z.any(),
  hasRecurrence: z.boolean().optional(),
  recurrence: z
    .union([recurrenceSchema, z.undefined()])
    .optional()
    .refine(
      (val) => !val || dayjs(val.end_date).isAfter(dayjs(val.start_date)),
      { message: "Data final deve ser após a inicial" }
    ),
});

const formSchema = z.object({
  specialty_id: z.coerce.number({ required_error: "Selecione a especialidade" }),
  college_location_id: z.coerce.number({ required_error: "Selecione o local" }),
  schedules: z.array(scheduleSchema).min(1),
});

type FormValues = z.infer<typeof formSchema>;

/* ──────────────────────────────────────────────────────────
 * Componente
 * ────────────────────────────────────────────────────────── */
export default function ScheduleForm() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialty_id: specialties[0].id,
      college_location_id: locations[0].id,
      schedules: [
        {
          week_day: 1,
          turn: 0,
          start_time: dayjs().hour(8).minute(0),
          end_time: dayjs().hour(12).minute(0),
          hasRecurrence: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules",
  });

  const onSubmit = (data: FormValues) => {
    const output = data.schedules.map((s) => ({
      ...s,
      start_time: s.start_time ? s.start_time.format("HH:mm") : null,
      end_time: s.end_time ? s.end_time.format("HH:mm") : null,
      recurrence:
        s.hasRecurrence && s.recurrence
          ? {
              ...s.recurrence,
              start_date: dayjs(s.recurrence.start_date).format("YYYY-MM-DD"),
              end_date: dayjs(s.recurrence.end_date).format("YYYY-MM-DD"),
            }
          : undefined,
    }));

    console.log("Payload:", { ...data, schedules: output });
  };

  /* Helper para obter erros aninhados dos schedules */
  const getScheduleError = (idx: number, path: keyof (typeof scheduleSchema)["shape"] | string) => {
    const scheduleErrors = errors.schedules?.[idx] as Partial<Record<keyof FormValues["schedules"][number], { message?: string }>>;
    return scheduleErrors && scheduleErrors[path as keyof typeof scheduleErrors];
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Alocar Horários Fixos com Repetição
          </Typography>

          {/* Campos de cabeçalho */}
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)" }}
            gap={2}
            mb={3}
          >
            <Controller
              name="specialty_id"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  select
                  label="Especialidade"
                  fullWidth
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  {specialties.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="college_location_id"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  select
                  label="Local"
                  fullWidth
                  value={field.value}
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
          </Box>

          {/* Lista de schedules */}
          {fields.map((field, index) => {
            const schedule = watch(`schedules.${index}`);
            return (
              <Box key={field.id} mb={4} borderBottom={1} borderColor="divider" pb={2}>
                {/* Linha principal */}
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", sm: "2fr 1fr 2fr 2fr auto" }}
                  gap={2}
                  alignItems="center"
                >
                  <Controller
                    name={`schedules.${index}.week_day` as const}
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        select
                        label="Dia da Semana"
                        fullWidth
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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

                  <Controller
                    name={`schedules.${index}.turn` as const}
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        select
                        label="Turno"
                        fullWidth
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      >
                        {turnOptions.map((t) => (
                          <MenuItem key={t.value} value={t.value}>
                            {t.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Controller
                    name={`schedules.${index}.start_time` as const}
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        label="Início"
                        value={field.value || dayjs()}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            error: !!getScheduleError(index, "start_time"),
                            helperText: getScheduleError(index, "start_time")?.message,
                          },
                        }}
                      />
                    )}
                  />

                  <Controller
                    name={`schedules.${index}.end_time` as const}
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        label="Fim"
                        value={field.value || dayjs()}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            error: !!getScheduleError(index, "end_time"),
                            helperText: getScheduleError(index, "end_time")?.message,
                          },
                        }}
                      />
                    )}
                  />

                  <IconButton onClick={() => remove(index)} disabled={fields.length === 1}>
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {/* Recorrência */}
                <Box mt={2}>
                  <Controller
                    name={`schedules.${index}.hasRecurrence` as const}
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value || false} />}
                        label="Repetir esse horário"
                      />
                    )}
                  />
                </Box>

                {schedule?.hasRecurrence && (
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", sm: "repeat(4, 1fr)" }}
                    gap={2}
                    mt={2}
                  >
                    <Controller
                      name={`schedules.${index}.recurrence.start_date` as const}
                      control={control}
                      render={({ field, fieldState }) => (
                        <DatePicker
                          label="Data Início"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => field.onChange(date?.toDate() || null)}
                          slotProps={{
                            textField: {
                              error: !!fieldState.error,
                              helperText: fieldState.error?.message,
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name={`schedules.${index}.recurrence.end_date` as const}
                      control={control}
                      render={({ field, fieldState }) => (
                        <DatePicker
                          label="Data Fim"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => field.onChange(date?.toDate() || null)}
                          slotProps={{
                            textField: {
                              error: !!fieldState.error,
                              helperText: fieldState.error?.message,
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name={`schedules.${index}.recurrence.frequency_type` as const}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          select
                          label="Frequência"
                          fullWidth
                          value={field.value ?? 1}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        >
                          {frequencyTypes.map((f) => (
                            <MenuItem key={f.value} value={f.value}>
                              {f.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <Controller
                      name={`schedules.${index}.recurrence.frequency_interval` as const}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          type="number"
                          label="Intervalo"
                          fullWidth
                          inputProps={{ min: 1 }}
                          value={field.value ?? 1}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Box>
                )}
              </Box>
            );
          })}

          {/* Botões */}
          <Button
            startIcon={<AddIcon />}
            onClick={() =>
              append({
                week_day: 1,
                turn: 0,
                start_time: dayjs().hour(8).minute(0),
                end_time: dayjs().hour(12).minute(0),
                hasRecurrence: false,
                recurrence: {
                  start_date: dayjs().toDate(),
                  end_date: dayjs().add(1, "month").toDate(),
                  frequency_type: 1,
                  frequency_interval: 1,
                  max_occurrences: undefined,
                },
              })
            }
          >
            Adicionar horário
          </Button>

          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              onClick={handleSubmit(onSubmit, (errors) => {
                console.log("Validation errors:", errors);
              })}
            >
              Salvar Alocações
            </Button>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
