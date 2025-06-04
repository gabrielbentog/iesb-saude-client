import type { z } from 'zod';
import { formSchema } from '@/app/components/agendamento/schemas';

export type ScheduleFormValues = z.infer<typeof formSchema>;
