"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Divider,
  IconButton,
  Box,
  Chip,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  AlertTitle,
  Collapse,
  Grid,
} from "@mui/material";
import {
  AccessTime,
  CalendarMonth,
  Delete,
  DeleteForever,
  Event,
  EventRepeat,
  LocationOn,
  Close,
  Description,
} from "@mui/icons-material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiFetch } from "@/app/lib/api";

/* ===== Tipagem ===== */
export interface EventDetail {
  id: string;
  date: Date;
  title: string;
  description?: string;
  location?: string;
  allDay?: boolean;

  /* recorrência */
  isRecurring?: boolean; // true se veio de um time_slot com recurrence_rule
  timeSlotId?: number;   // id do time_slot original
}

interface Props {
  open: boolean;
  event: EventDetail | null;
  onClose: () => void;
  onRefresh: () => void; // refetch agenda após excluir
}

/* ====================================================== */
export function EventDetailDialog({
  open,
  event,
  onClose,
  onRefresh,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [deleteType, setDeleteType] = useState<"single" | "series" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!event) return null;

  const formatEventDate = () => {
    if (event.allDay) {
      return format(event.date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } else {
      return format(event.date, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    }
  };

  const handleDeleteClick = (type: "single" | "series") => {
    setDeleteType(type);
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setDeleteType(null);
  };

  /* -- excluir somente esta ocorrência ---------------- */
  const deleteOnlyThis = async () => {
    if (!event.timeSlotId) return;
    try {
      setLoading(true);
      setError(null);
      await apiFetch("/api/time_slot_exceptions", {
        method: "POST",
        body: JSON.stringify({
          timeSlotException: {
            time_slot_id: event.timeSlotId,
            date: format(event.date, "yyyy-MM-dd"),
          },
        }),
      });
      onClose();
      onRefresh();
    } catch (err) {
      setError("Erro ao excluir evento. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  /* -- excluir toda a série --------------------------- */
  const deleteSeries = async () => {
    if (!event.timeSlotId) return;
    try {
      setLoading(true);
      setError(null);
      await apiFetch(`/api/time_slots/${event.timeSlotId}`, { method: "DELETE" });
      onClose();
      onRefresh();
    } catch (err) {
      setError("Erro ao excluir série de eventos. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteType === "single") {
      deleteOnlyThis();
    } else if (deleteType === "series") {
      deleteSeries();
    }
  };

  /* --------------------------------------------------- */
  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, overflow: 'hidden' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {event.isRecurring ? <EventRepeat /> : <Event />}
          <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
            {event.title}
          </Typography>
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          disabled={loading}
          aria-label="fechar"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Collapse in={!!error}>
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <IconButton
                aria-label="fechar"
                color="inherit"
                size="small"
                onClick={() => setError(null)}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>Erro</AlertTitle>
            {error}
          </Alert>
        </Collapse>

        <Collapse in={showConfirmation}>
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <IconButton
                aria-label="fechar"
                color="inherit"
                size="small"
                onClick={handleCancelDelete}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>Confirmação</AlertTitle>
            {deleteType === "single" ? (
              <Typography variant="body2">
                Tem certeza que deseja excluir esta ocorrência do evento?
              </Typography>
            ) : (
              <Typography variant="body2">
                Tem certeza que deseja excluir toda a série de eventos? Esta ação removerá todos os horários futuros desta série.
              </Typography>
            )}
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                variant="outlined" 
                color="inherit" 
                onClick={handleCancelDelete}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                size="small" 
                variant="contained" 
                color="error" 
                onClick={handleConfirmDelete}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {loading ? "Excluindo..." : "Confirmar exclusão"}
              </Button>
            </Box>
          </Alert>
        </Collapse>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth color="primary" />
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {formatEventDate()}
                  </Typography>
                </Box>
                
                {!event.allDay && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {format(event.date, "HH:mm", { locale: ptBR })}
                    </Typography>
                    {event.allDay && (
                      <Chip 
                        label="Dia todo" 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                )}

                {event.isRecurring && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventRepeat color="secondary" />
                    <Typography variant="body2" color="text.secondary">
                      Evento recorrente
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          {event.description && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Description color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Descrição
                    </Typography>
                    <Typography variant="body2">
                      {event.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          )}

          {event.location && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationOn color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Local
                    </Typography>
                    <Typography variant="body2">
                      {event.location}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <Divider />
      
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Box>
          {event.isRecurring && !showConfirmation && (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Excluir apenas esta ocorrência do evento">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteClick("single")}
                  disabled={loading}
                  startIcon={<Delete />}
                  size="small"
                >
                  Excluir só este
                </Button>
              </Tooltip>
              <Tooltip title="Excluir toda a série de eventos recorrentes">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteClick("series")}
                  disabled={loading}
                  startIcon={<DeleteForever />}
                  size="small"
                >
                  Excluir toda série
                </Button>
              </Tooltip>
            </Stack>
          )}
        </Box>
        <Button 
          variant="contained" 
          onClick={onClose} 
          disabled={loading}
          color="primary"
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}