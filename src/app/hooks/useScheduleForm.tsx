import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { FormValues, formSchema } from "@/app/components/agendamento/schemas";

export const useScheduleForm = () => {
  return useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repeat_type: 0,
      period_start: undefined,
      period_end:   undefined,
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
};