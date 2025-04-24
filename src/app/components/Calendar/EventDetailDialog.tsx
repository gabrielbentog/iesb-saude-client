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
  Paper,
  Tooltip,
  CircularProgress,
  Grid,
  Chip,
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
import { useToast } from "@/app/contexts/ToastContext";

/* ===== Tipagem ===== */
export interface EventDetail {
  id: string;
  date: Date;
  title: string;
  description?: string;
  location?: string;
  allDay?: boolean;
  isRecurring?: boolean;
  timeSlotId?: number;
}

interface Props {
  open: boolean;
  event: EventDetail | null;
  onClose: () => void;
  onDeleted: (info: { type: "single" | "series"; id?: string; timeSlotId?: number }) => void;
}

/* ====================================================== */
export function EventDetailDialog({
  open,
  event,
  onClose,
  onDeleted,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [deleteType, setDeleteType] = useState<"single" | "series" | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { showToast } = useToast();

  if (!event) return null;

  /* ---------- helpers ---------- */
  const formatEventDate = () =>
    event.allDay
      ? format(event.date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      : format(event.date, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
          locale: ptBR,
        });

  const handleDeleteClick = (type: "single" | "series") => {
    setDeleteType(type);
    setShowConfirmation(true);
  };
  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setDeleteType(null);
  };

  /* ---------- API calls ---------- */
  const deleteOnlyThis = async () => {
    if (!event.timeSlotId) return;
    try {
      setLoading(true);
      await apiFetch("/api/time_slot_exceptions", {
        method: "POST",
        body: JSON.stringify({
          time_slot_exception: {
            time_slot_id: event.timeSlotId,
            date: format(event.date, "yyyy-MM-dd"),
          },
        }),
      });
      showToast({ message: "Ocorrência excluída", severity: "success" });
      onDeleted({ type: "single", id: event.id });
      onClose();
    } catch (err) {
      console.error(err);
      showToast({ message: "Erro ao excluir ocorrência", severity: "error" });
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const deleteSeries = async () => {
    if (!event.timeSlotId) return;
    try {
      setLoading(true);
      await apiFetch(`/api/time_slots/${event.timeSlotId}`, { method: "DELETE" });
      showToast({ message: "Série excluída", severity: "success" });
      onDeleted({ type: "series", timeSlotId: event.timeSlotId });
      onClose();
    } catch (err) {
      console.error(err);
      showToast({ message: "Erro ao excluir série", severity: "error" });
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const confirm = () => (deleteType === "single" ? deleteOnlyThis() : deleteSeries());

  /* ---------- JSX ---------- */
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
    >
      {/* header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {event.isRecurring ? <EventRepeat /> : <Event />}
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {event.title}
          </Typography>
        </Box>
        <IconButton color="inherit" onClick={onClose} disabled={loading}>
          <Close />
        </IconButton>
      </DialogTitle>

      {/* content */}
      <DialogContent sx={{ py: 3 }}>
        {showConfirmation && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              borderColor: "warning.main",
              bgcolor: "warning.light",
            }}
          >
            <Typography fontWeight={500} gutterBottom>
              {deleteType === "single"
                ? "Excluir esta ocorrência?"
                : "Excluir toda a série?"}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleCancelDelete}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={confirm}
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={16} color="inherit" /> : null
                }
              >
                Confirmar
              </Button>
            </Stack>
          </Paper>
        )}

        {/* infos */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarMonth color="primary" />
                  <Typography fontWeight={500}>{formatEventDate()}</Typography>
                </Box>

                {!event.allDay && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTime color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {format(event.date, "HH:mm", { locale: ptBR })}
                    </Typography>
                  </Box>
                )}

                {event.isRecurring && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Description color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2">Descrição</Typography>
                    <Typography variant="body2">{event.description}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          )}

          {event.location && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <LocationOn color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2">Local</Typography>
                    <Typography variant="body2">{event.location}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      {/* footer */}
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        {event.isRecurring && !showConfirmation && (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Excluir apenas esta ocorrência">
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => handleDeleteClick("single")}
                disabled={loading}
                startIcon={<Delete />}
              >
                Excluir só esta
              </Button>
            </Tooltip>
            <Tooltip title="Excluir toda a série">
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => handleDeleteClick("series")}
                disabled={loading}
                startIcon={<DeleteForever />}
              >
                Excluir série
              </Button>
            </Tooltip>
          </Stack>
        )}

        <Button variant="contained" onClick={onClose} disabled={loading}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
