import { z } from "zod";
import dayjs from "dayjs";

export const timeSchema = z
  .object({
    start_time: z.any(),
    end_time: z.any(),
  })
  .refine((t) => dayjs(t.end_time).isAfter(dayjs(t.start_time)), {
    message: "Hora fim deve ser maior que início",
    path: ["end_time"],
  });

export const scheduleSchema = z.object({
  date: z.date().optional(),
  week_day: z.coerce.number().optional(),
  times: z.array(timeSchema).min(1, "Inclua pelo menos um intervalo"),
});

export const formSchema = z
  .object({
    college_location_id: z.string().optional(),
    repeat_type: z.coerce.number(), // 0 data | 1 semanal
    period_start: z.date().nullable().optional(),   // ← nullable()
    period_end:   z.date().nullable().optional(),
    schedules: z.array(scheduleSchema).min(1),
  })
  .refine((d) => d.college_location_id != null, {
    path: ["college_location_id"],
    message: "Selecione o local",
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
  )
  .refine(
    d => d.repeat_type === 1 ? !!d.period_start && !!d.period_end : true,
    { path: ["period_start"], message: "Informe o período" }
  )
  .refine(
    d => d.repeat_type === 1
        ? dayjs(d.period_end).isAfter(dayjs(d.period_start))
        : true,
    { path: ["period_end"], message: "O fim deve ser depois do início" }
  );
export type FormValues = z.infer<typeof formSchema>;