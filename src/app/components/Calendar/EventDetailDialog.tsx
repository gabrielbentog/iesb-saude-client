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
  Button as LoadingButton
} from "@mui/material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiFetch } from "@/app/lib/api";
import type { EventDetailDialogProps } from "@/app/types";
import { useToast } from "@/app/contexts/ToastContext";

type DeleteTarget = "onlyThis" | "series" | "singleNoRecurrence" | null;

export function EventDetailDialog({
  open,
  event,
  onClose,
  onDeleted,
}: EventDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<DeleteTarget>(null);
  const { showToast } = useToast();

  if (!event) return null;

  /* ---------- exclusão centralizada ---------- */
  const handleDelete = async () => {
    if (!confirmTarget) return;
    try {
      setLoading(true);

      switch (confirmTarget) {
        case "onlyThis":
          await apiFetch("/api/time_slot_exceptions", {
            method: "POST",
            body: JSON.stringify({
              timeSlotException: {
                timeSlotId: event.timeSlotId,
                date: format(event.date, "yyyy-MM-dd"),
              },
            }),
          });
          onDeleted({ type: "single", id: event.id });
          showToast({ message: "Evento removido", severity: "success" });
          break;

        case "series":
          await apiFetch(`/api/time_slots/${event.timeSlotId}`, {
            method: "DELETE",
          });
          onDeleted({ type: "series", timeSlotId: event.timeSlotId! });
          showToast({ message: "Série removida", severity: "success" });
          break;

        case "singleNoRecurrence":
          await apiFetch(`/api/time_slots/${event.timeSlotId}`, {
            method: "DELETE",
          });
          onDeleted({ type: "single", id: event.id });
          showToast({ message: "Horário removido", severity: "success" });
          break;
      }

      handleClose();
    } catch (err: unknown) {
      showToast({
        message: err instanceof Error ? err.message : "Erro ao excluir",
        severity: "error",
      });
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLoading(false);
    setConfirmTarget(null);
    onClose();
  };

  /* ---------- helpers ---------- */
  const askDelete = (target: DeleteTarget) => () => setConfirmTarget(target);

  /* ---------- layout dinâmico ---------- */
  const dialogTitle = confirmTarget ? "Confirmar exclusão" : event.title;

  const dialogContent = confirmTarget ? (
    <Typography variant="body2">
      {confirmTarget === "onlyThis" && "Excluir apenas este evento?"}
      {confirmTarget === "series" && "Excluir TODA a série de eventos?"}
      {confirmTarget === "singleNoRecurrence" && "Excluir este horário?"}
    </Typography>
  ) : (
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
  );

  const dialogActions = confirmTarget ? (
    <>
      <LoadingButton
        color="error"
        loading={loading}
        onClick={handleDelete}
      >
        Excluir
      </LoadingButton>
      <Button onClick={() => setConfirmTarget(null)} disabled={loading}>
        Cancelar
      </Button>
    </>
  ) : (
    <>
      {event.isRecurring ? (
        <>
          <Button color="error" onClick={askDelete("onlyThis")}>
            Excluir só este
          </Button>
          <Button color="error" onClick={askDelete("series")}>
            Excluir toda série
          </Button>
        </>
      ) : (
        <Button color="error" onClick={askDelete("singleNoRecurrence")}>
          Excluir
        </Button>
      )}
      <Button onClick={onClose}>Fechar</Button>
    </>
  );

  /* ---------- render ---------- */
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent dividers>{dialogContent}</DialogContent>
      <DialogActions>{dialogActions}</DialogActions>
    </Dialog>
  );
}
