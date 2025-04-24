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
} from "@mui/material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiFetch } from "@/app/lib/api";

/* ===== Tipos ===== */
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

export function EventDetailDialog({ open, event, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);
  if (!event) return null;

  /* ----- Ações de exclusão ----- */
  const deleteOnlyThis = async () => {
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
      onDeleted({ type: "single", id: event.id });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const deleteSeries = async () => {
    if (!event.timeSlotId) return;
    if (!confirm("Remover TODOS os eventos desta série?")) return;
    try {
      setLoading(true);
      await apiFetch(`/api/time_slots/${event.timeSlotId}`, { method: "DELETE" });
      onDeleted({ type: "series", timeSlotId: event.timeSlotId });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const deleteSingleNoRecurrence = async () => {
    if (!event.timeSlotId) return;
    if (!confirm("Remover este horário?")) return;
    try {
      setLoading(true);
      await apiFetch(`/api/time_slots/${event.timeSlotId}`, { method: "DELETE" });
      onDeleted({ type: "single", id: event.id });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  /* ----- Render ----- */
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{event.title}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {event.allDay
              ? "Dia todo"
              : format(event.date, "dd/MM/yyyy · HH:mm", { locale: ptBR })}
          </Typography>

          {event.description && (
            <Typography variant="body2">{event.description}</Typography>
          )}

          {event.location && (
            <Typography variant="body2" color="text.secondary">
              Local: {event.location}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        {event.isRecurring ? (
          <>
            <Button color="error" onClick={deleteOnlyThis} disabled={loading}>
              Excluir só este
            </Button>
            <Button color="error" onClick={deleteSeries} disabled={loading}>
              Excluir toda série
            </Button>
          </>
        ) : (
          <Button
            color="error"
            onClick={deleteSingleNoRecurrence}
            disabled={loading}
          >
            Excluir
          </Button>
        )}

        <Button onClick={onClose} disabled={loading}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
