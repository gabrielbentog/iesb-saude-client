// src/app/components/ui/ActionButton.tsx
"use client";

import React, { useState } from "react";
import Button        from "@mui/material/Button";
import Dialog        from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle   from "@mui/material/DialogTitle";
import Typography    from "@mui/material/Typography";
import { alpha }     from "@mui/material/styles";

/* Ícones */
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon  from "@mui/icons-material/Edit"; // exemplo extra

/* ------------------------------------------------------------------ */
/* Tipagens                                                           */
/* ------------------------------------------------------------------ */
export type IconKind = "check" | "close" | "edit";

export interface ConfirmConfig {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ActionButtonProps {
  colorKey: "success" | "error" | "info" | "warning";
  label: string;
  onClick: () => void;
  disabled?: boolean;
  iconType: IconKind;
  confirm?: ConfirmConfig;      // ← NOVO (opcional)
}

/* Mapeamento simplificado de ícones */
const iconMap: Record<IconKind, React.ReactNode> = {
  check: <CheckIcon />,
  close: <CloseIcon />,
  edit:  <EditIcon />,
};

/* ------------------------------------------------------------------ */
/* Componente                                                         */
/* ------------------------------------------------------------------ */
export const ActionButton: React.FC<ActionButtonProps> = ({
  colorKey,
  label,
  onClick,
  disabled = false,
  iconType,
  confirm,
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (confirm) return setOpen(true);
    onClick();
  };

  const handleConfirm = () => {
    setOpen(false);
    onClick();
  };

  return (
    <>
      <Button
        size="small"
        startIcon={iconMap[iconType]}
        aria-label={label}
        onClick={handleClick}
        disabled={disabled}
        sx={(t) => ({
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 2,
          px: 2.5,
          py: 0.75,

          /* estilo base (ativo) */
          backgroundColor: "#FFF",
          color: t.palette[colorKey].main,
          border: `2px solid ${alpha(t.palette[colorKey].main, 0.25)}`,
          "& .MuiSvgIcon-root": { color: t.palette[colorKey].main },

          "&:hover": {
            backgroundColor: alpha("#FFF", 0.9),
            borderColor: t.palette[colorKey].main,
            boxShadow: `0 0 4px ${alpha(t.palette[colorKey].main, 0.35)}`,
          },

          /* estado desabilitado */
          "&.Mui-disabled": {
            backgroundColor: t.palette.action.disabledBackground,
            color: t.palette.action.disabled,
            borderColor: t.palette.action.disabledBackground,
            boxShadow: "none",
            "& .MuiSvgIcon-root": { color: t.palette.action.disabled },
          },
        })}
      >
        {label}
      </Button>

      {confirm && (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>{confirm.title ?? "Confirmação"}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              {confirm.description}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setOpen(false)}>
              {confirm.cancelLabel ?? "Cancelar"}
            </Button>
            <Button variant="contained" onClick={handleConfirm}>
              {confirm.confirmLabel ?? "Confirmar"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
