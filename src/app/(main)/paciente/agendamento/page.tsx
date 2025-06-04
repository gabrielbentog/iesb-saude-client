// src/app/(main)/paciente/agendamento/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  Grid,
  Divider,
  Alert,
  Badge,
  CircularProgress,
} from '@mui/material';
// import { useTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  LocalizationProvider,
  DatePicker,
  PickersDay,
} from '@mui/x-date-pickers';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { apiFetch } from '@/app/lib/api';
import type { Campus, Especialidade, Slot } from '@/app/types';


dayjs.locale('pt-br');

const steps = ['Informações', 'Data e Horário', 'Objetivo', 'Confirmação'];

export default function AgendarConsultaPage() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [campusList, setCampusList] = useState<Campus[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loadingCampuses, setLoadingCampuses] = useState<boolean>(true);
  const [loadingSpecialties, setLoadingSpecialties] = useState<boolean>(false);
  const [selectedCampusId, setSelectedCampusId] = useState<string>('');
  const [selectedEspecialidadeId, setSelectedEspecialidadeId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [currentPickerMonth, setCurrentPickerMonth] = useState<Dayjs>(dayjs());
  const [availableDatesInMonth, setAvailableDatesInMonth] = useState<Set<string>>(new Set());
  const [timeSlotsForSelectedDate, setTimeSlotsForSelectedDate] = useState<Slot[]>([]);
  const [selectedApiSlot, setSelectedApiSlot] = useState<Slot | null>(null);
  const [loadingAvailableDates, setLoadingAvailableDates] = useState<boolean>(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [objetivo, setObjetivo] = useState<string>('');

  useEffect(() => {
    setLoadingCampuses(true);
    apiFetch('/api/college_locations')
      .then((res) => setCampusList((res as { data: Campus[] }).data))
      .catch(() => setApiError("Erro ao carregar opções de campus."))
      .finally(() => setLoadingCampuses(false));
  }, []);

  useEffect(() => {
    setSelectedEspecialidadeId('');
    setEspecialidades([]);
    setSelectedDate(null);
    setAvailableDatesInMonth(new Set());
    setTimeSlotsForSelectedDate([]);
    setSelectedApiSlot(null);
    setApiError(null);

    if (selectedCampusId) {
      setLoadingSpecialties(true);
      apiFetch(`/api/college_locations/${selectedCampusId}/specialties`)
        .then((res) => {
          const data = (res as { data: Especialidade[] }).data;
          setEspecialidades(data);
        })
        .catch(() => setApiError("Erro ao carregar especialidades."))
        .finally(() => setLoadingSpecialties(false));
    }
  }, [selectedCampusId]);

  const fetchAvailableDatesForMonth = useCallback(async (monthToFetch: Dayjs) => {
    if (!selectedEspecialidadeId || !selectedCampusId) return;
    setLoadingAvailableDates(true);
    setApiError(null);
    try {
      const start = monthToFetch.startOf('month').format('YYYY-MM-DD');
      const end = monthToFetch.endOf('month').format('YYYY-MM-DD');
      const response = await apiFetch(`/api/calendar?start=${start}&end=${end}&specialtyId=${selectedEspecialidadeId}&campusId=${selectedCampusId}`);
      const uniqueDates = new Set<string>();
      (response as { free?: Slot[] }).free?.forEach((slot: Slot) => uniqueDates.add(dayjs(slot.start_at).format('YYYY-MM-DD')));
      setAvailableDatesInMonth(uniqueDates);
    } catch {
      setApiError("Não foi possível carregar as datas disponíveis.");
    } finally {
      setLoadingAvailableDates(false);
    }
  }, [selectedEspecialidadeId, selectedCampusId]);

  useEffect(() => {
    if (activeStep === 1) fetchAvailableDatesForMonth(currentPickerMonth);
  }, [fetchAvailableDatesForMonth, currentPickerMonth, activeStep]);

  useEffect(() => {
    if (selectedDate && selectedEspecialidadeId && selectedCampusId && activeStep === 1) {
      setLoadingTimeSlots(true);
      setSelectedApiSlot(null);
      setTimeSlotsForSelectedDate([]);
      const dateStr = selectedDate.format('YYYY-MM-DD');
      apiFetch(`/api/calendar?start=${dateStr}&end=${dateStr}&specialtyId=${selectedEspecialidadeId}&campusId=${selectedCampusId}`)
        .then((res) => {
          const typedRes = res as { free?: Slot[] };
          const slots = typedRes.free?.sort((a: Slot, b: Slot) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
          setTimeSlotsForSelectedDate(slots || []);
        })
        .catch(() => setApiError("Não foi possível carregar os horários."))
        .finally(() => setLoadingTimeSlots(false));
    }
  }, [selectedDate, selectedEspecialidadeId, selectedCampusId, activeStep]);

  const handleSubmit = async () => {
    setApiError(null);

    if (!selectedApiSlot || !objetivo.trim() || !selectedDate) {
      setApiError("Por favor, complete todos os campos obrigatórios.");
      return;
    }

    try {
      const sessionStr = localStorage.getItem('session');
      if (!sessionStr) {
        setApiError("Sessão não encontrada. Faça login novamente.");
        return;
      }

      const session = JSON.parse(sessionStr);
      const userId = session?.user?.id;

      if (!userId) {
        setApiError("ID do usuário não encontrado na sessão.");
        return;
      }

      const payload = {
        appointment: {
          time_slot_id: selectedApiSlot.id,
          user_id: userId,
          date: selectedDate.format('YYYY-MM-DD'),
          start_time: dayjs(selectedApiSlot.start_at).format('HH:mm'),
          end_time: dayjs(selectedApiSlot.end_at).format('HH:mm'),
          status: 'pending',
          notes: objetivo.trim(),
        },
      };

      await apiFetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      alert("Agendamento criado com sucesso!");
      setActiveStep(0); // Ou redirecione se quiser
    } catch (err: any) {
      if (err?.response?.status === 422 && err?.response?.json) {
        const errorData = await err.response.json();
        setApiError(errorData.errors?.join(', ') || "Erro ao agendar.");
      } else {
        setApiError("Erro inesperado ao tentar agendar a consulta.");
      }
    }
  };

  const renderDayWithBadge = (props: PickersDayProps<Dayjs>) => {
    const dateString = props.day.format('YYYY-MM-DD');
    const hasSlots = availableDatesInMonth.has(dateString);
    return (
      <Badge overlap="circular" color="primary" variant={hasSlots ? "dot" : undefined}>
        <PickersDay {...props} disabled={props.disabled || (!hasSlots && !!selectedEspecialidadeId && !!selectedCampusId && !loadingAvailableDates)} />
      </Badge>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Box sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
        </Stepper>

        {apiError && <Alert severity="error">{apiError}</Alert>}

        <Card sx={{ p: 3 }}>
          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {loadingCampuses ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 56 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <TextField
                    label="Campus"
                    select
                    fullWidth
                    value={selectedCampusId}
                    onChange={(e) => setSelectedCampusId(e.target.value)}
                  >
                    {campusList.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {loadingSpecialties ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 56 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <TextField
                    label="Especialidade"
                    select
                    fullWidth
                    value={selectedEspecialidadeId}
                    onChange={(e) => setSelectedEspecialidadeId(e.target.value)}
                  >
                    {especialidades.map((e) => (
                      <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative' }}>
                  <DatePicker
                    label="Data da Consulta"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    onMonthChange={setCurrentPickerMonth}
                    slots={{ day: renderDayWithBadge }}
                    slotProps={{ textField: { fullWidth: true } }}
                    disablePast
                  />
                  {loadingAvailableDates && (
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        right: 16,
                        marginTop: '-12px',
                      }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                {loadingTimeSlots ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 56 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <TextField
                    label="Horário"
                    select
                    fullWidth
                    value={selectedApiSlot?.start_at || ''}
                    onChange={(e) =>
                      setSelectedApiSlot(timeSlotsForSelectedDate.find((s) => s.start_at === e.target.value) || null)
                    }
                  >
                    {timeSlotsForSelectedDate.map((s) => (
                      <MenuItem key={s.id} value={s.start_at}>
                        {dayjs(s.start_at).format('HH:mm')} - {dayjs(s.end_at).format('HH:mm')}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <TextField label="Objetivo da Consulta" fullWidth multiline rows={4} value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
          )}

          {activeStep === 3 && (
            <Box>
              <Typography variant="h6">Revise os Dados</Typography>
              <Typography>Campus: {campusList.find((c) => String(c.id) === String(selectedCampusId))?.name}</Typography>
              <Typography>Especialidade: {especialidades.find((e) => String(e.id) === String(selectedEspecialidadeId))?.name}</Typography>
              <Typography>Data: {selectedDate?.format('DD/MM/YYYY')}</Typography>
              <Typography>Horário: {selectedApiSlot ? `${dayjs(selectedApiSlot.start_at).format('HH:mm')} - ${dayjs(selectedApiSlot.end_at).format('HH:mm')}` : ''}</Typography>
              <Typography>Objetivo: {objetivo}</Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button disabled={activeStep === 0} onClick={() => setActiveStep((p) => p - 1)}>Voltar</Button>
            {activeStep < steps.length - 1 ? (
              <Button onClick={() => setActiveStep((p) => p + 1)} disabled={(activeStep === 0 && (!selectedCampusId || !selectedEspecialidadeId)) || (activeStep === 1 && (!selectedDate || !selectedApiSlot)) || (activeStep === 2 && !objetivo.trim())}>
                Próximo
              </Button>
            ) : (
              <Button variant="contained" onClick={handleSubmit}>Confirmar</Button>
            )}
          </Box>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}
