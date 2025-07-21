import Button from '@mui/material/Button'
import { alpha } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

export interface ActionButtonProps {
  colorKey: 'success' | 'error' | 'info' | 'warning'
  label: string
  onClick: () => void
  disabled?: boolean;           // ← aqui
  iconType: 'check' | 'close'
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  colorKey,
  label,
  onClick,
  disabled = false,
  iconType,
}) => (
  <Button
    size="small"
    startIcon={iconType === "check" ? <CheckIcon /> : <CloseIcon />}
    onClick={onClick}
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

      /* --------- NOVO: estilos para estado desabilitado ---------- */
      "&.Mui-disabled": {
        backgroundColor: t.palette.action.disabledBackground, // cinza claro
        color: t.palette.action.disabled,                     // cinza texto
        borderColor: t.palette.action.disabledBackground,
        boxShadow: "none",
        "& .MuiSvgIcon-root": { color: t.palette.action.disabled },
      },
    })}
  >
    {label}
  </Button>
);

