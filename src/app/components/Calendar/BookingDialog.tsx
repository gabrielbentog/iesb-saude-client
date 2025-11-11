// src/app/components/Calendar/BookingDialog.tsx
"use client";

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, TextField, Stack, Box, CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { BookingDialogProps } from '@/app/types';

export function BookingDialog({ open, event, onClose, onSubmitBooking }: BookingDialogProps) {
  const [objective, setObjective] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!event) return null;

  const handleSubmit = async () => {
    if (!objective.trim()) return;

    setIsLoading(true);
    try {
      await onSubmitBooking({ objective });
      setObjective('');
    } catch (error) {
      console.error("Booking submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    if (!isLoading) {
      setObjective(''); // Reset objective on close
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agendar Consulta</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            Horário Selecionado:
          </Typography>
          <Box pl={1} borderLeft={2} borderColor="primary.main">
            <Typography>
              <strong>Data:</strong> {format(event.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </Typography>
            <Typography>
              <strong>Especialidade:</strong> {event.category}
            </Typography>
            {event.description && ( // Assuming description holds campus/specialty info for free slots
              <Typography>
                <strong>Local/Info:</strong> {event.description}
              </Typography>
            )}
          </Box>
          <TextField
            label="Objetivo da Consulta"
            multiline
            rows={3}
            fullWidth
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            variant="outlined"
            helperText="Descreva brevemente o motivo da sua consulta."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleDialogClose} disabled={isLoading} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!objective.trim() || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}