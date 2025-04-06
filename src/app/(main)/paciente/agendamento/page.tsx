'use client';

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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  LocalizationProvider,
  DatePicker,
} from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';

const especialidades = ['Psicologia', 'Nutrição', 'Fisioterapia'];
const campusList = ['Asa Sul', 'Ceilândia', 'Taguatinga'];
const turnos = ['Manhã', 'Tarde', 'Noite'];
const horariosDisponiveis = ['08:00', '10:00', '14:00', '16:00', '18:00'];

const steps = ['Consulta', 'Data & Horário', 'Objetivo', 'Confirmação'];

export default function AgendarConsultaPage() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const [especialidade, setEspecialidade] = useState('');
  const [campus, setCampus] = useState('');
  const [turno, setTurno] = useState('');
  const [data, setData] = useState<Dayjs | null>(null);
  const [horario, setHorario] = useState('');
  const [objetivo, setObjetivo] = useState('');

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const isLastStep = activeStep === steps.length - 1;

  const handleSubmit = () => {
    console.log({
      especialidade,
      campus,
      turno,
      data: data?.format('DD/MM/YYYY'),
      horario,
      objetivo,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          px: { xs: 2, md: 6 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={1}>
          Agendamento de Consulta
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Existem 3 consultórios disponíveis para alocação automática.
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card sx={{ p: 4, borderRadius: 3 }}>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Especialidade"
                  select
                  fullWidth
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                >
                  {especialidades.map((esp) => (
                    <MenuItem key={esp} value={esp}>
                      {esp}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Campus"
                  select
                  fullWidth
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                >
                  {campusList.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Turno"
                  select
                  fullWidth
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                >
                  {turnos.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Data da Consulta"
                  value={data}
                  onChange={(newValue) => setData(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Horário"
                  select
                  fullWidth
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                >
                  {horariosDisponiveis.map((h) => (
                    <MenuItem key={h} value={h}>
                      {h}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <TextField
              label="Objetivo da Consulta"
              fullWidth
              multiline
              rows={4}
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
            />
          )}

          {activeStep === 3 && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Revise os dados
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <strong>Especialidade:</strong> {especialidade}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <strong>Campus:</strong> {campus}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <strong>Turno:</strong> {turno}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <strong>Data:</strong> {data?.format('DD/MM/YYYY')}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <strong>Horário:</strong> {horario}
                </Grid>
                <Grid item xs={12}>
                  <strong>Objetivo:</strong> {objetivo}
                </Grid>
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="text"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Voltar
            </Button>
            {isLastStep ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Confirmar Agendamento
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && (!especialidade || !campus || !turno)) ||
                  (activeStep === 1 && (!data || !horario)) ||
                  (activeStep === 2 && !objetivo)
                }
              >
                Avançar
              </Button>
            )}
          </Box>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}
