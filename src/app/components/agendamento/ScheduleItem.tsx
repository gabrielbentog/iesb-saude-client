import React from "react";
import { Box, IconButton, MenuItem, Paper, TextField } from "@mui/material";
import { Controller, useFieldArray } from "react-hook-form";
import { TimePicker, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { ScheduleItemProps } from '@/app/types';

const GRID_SM = "240px 1fr 1fr auto auto";
const GRID_XS = "1fr";

const weekDays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
] as const;

export const ScheduleItem: React.FC<ScheduleItemProps> = ({
  control,
  index: sIdx,
  repeatType,
  onRemoveDay,
  disableRemoveDay,
  allowEdit = true,
}) => {
  const { fields: timeFields, append, remove } = useFieldArray({
    control,
    name: `schedules.${sIdx}.times` as const,
  });

  type TimeError = {
    start_time?: { message?: string };
    end_time?: { message?: string };
  };

  const err = (t: number, k: "start_time" | "end_time") => {
    const scheduleErrors = control._formState.errors.schedules;
    if (Array.isArray(scheduleErrors)) {
      const timesErrors = scheduleErrors[sIdx]?.times;
      if (Array.isArray(timesErrors)) {
        return (timesErrors[t] as TimeError | undefined)?.[k];
      }
    }
    return undefined;
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      {/* linha cabeçalho */}
      <Box display="grid" gridTemplateColumns={{ xs: GRID_XS, sm: GRID_SM }} gap={2} alignItems="center">
        {/* Data ou Dia */}
        {repeatType === 1 ? (
          <Controller
            key={`week-${sIdx}`}
            name={`schedules.${sIdx}.week_day` as const}
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                select fullWidth label="Dia da Semana"
                name={field.name} inputRef={field.ref}
                value={field.value ?? ""}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(+e.target.value)}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {weekDays.map((d) => (
                  <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                ))}
              </TextField>
            )}
          />
        ) : (
          <Controller
            key={`date-${sIdx}`}
            name={`schedules.${sIdx}.date` as const}
            control={control}
            render={({ field, fieldState }) => (
              <DatePicker
                label="Data"
                value={field.value ? dayjs(field.value) : null}
                onChange={(d) => field.onChange(d?.toDate() || undefined)}
                minDate={dayjs()}
                slotProps={{ textField: { fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message } }}
              />
            )}
          />
        )}

        {/* Início – Fim cabeçalho */}
        <Controller
          name={`schedules.${sIdx}.times.0.start_time` as const}
          control={control}
          render={({ field }) => (
            <TimePicker
              label="Início" ampm={false} format="HH:mm" {...field}
              slotProps={{ textField: { error: !!err(0, "start_time"), helperText: err(0, "start_time")?.message } }}
            />
          )}
        />
        <Controller
          name={`schedules.${sIdx}.times.0.end_time` as const}
          control={control}
          render={({ field }) => (
            <TimePicker
              label="Fim" ampm={false} format="HH:mm" {...field}
              slotProps={{ textField: { error: !!err(0, "end_time"), helperText: err(0, "end_time")?.message } }}
            />
          )}
        />
        {allowEdit && (
          <>
            <IconButton size="small" sx={{ p: 0.5 }} onClick={() => append({ start_time: dayjs().hour(9), end_time: dayjs().hour(10) })}>
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" disabled={disableRemoveDay} onClick={onRemoveDay}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      {/* intervalos extras */}
      {timeFields.slice(1).map((t, idx) => {
        const i = idx + 1;
        return (
          <Box key={t.id} mt={2} display="grid" gridTemplateColumns={{ xs: GRID_XS, sm: GRID_SM }} gap={2} alignItems="center">
            <span />
            <Controller
              name={`schedules.${sIdx}.times.${i}.start_time` as const}
              control={control}
              render={({ field }) => (
                <TimePicker label="Início" ampm={false} format="HH:mm" {...field} slotProps={{ textField: { error: !!err(i, "start_time"), helperText: err(i, "start_time")?.message } }} />
              )}
            />
            <Controller
              name={`schedules.${sIdx}.times.${i}.end_time` as const}
              control={control}
              render={({ field }) => (
                <TimePicker label="Fim" ampm={false} format="HH:mm" {...field} slotProps={{ textField: { error: !!err(i, "end_time"), helperText: err(i, "end_time")?.message } }} />
              )}
            />
            <span />
            {allowEdit && (
              <IconButton size="small" onClick={() => remove(i)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        );
      })}
    </Paper>
  );
};
