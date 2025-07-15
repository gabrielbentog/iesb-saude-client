import Button from '@mui/material/Button'
import { alpha } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

export interface ActionButtonProps {
  colorKey: 'success' | 'error' | 'info' | 'warning'
  label: string
  onClick: () => void
  iconType: 'check' | 'close'
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  colorKey,
  label,
  onClick,
  iconType,
}) => (
  <Button
    size="small"
    startIcon={iconType === 'check' ? <CheckIcon /> : <CloseIcon />}
    onClick={onClick}
    sx={(t) => ({
      textTransform: 'none',
      fontWeight: 700,
      borderRadius: 2,
      px: 2.5,
      py: 0.75,

      /* ---------- NOVO: fundo branco ---------- */
      backgroundColor: '#FFF',
      color: t.palette[colorKey].main,

      /* contorno opcional — pode remover se quiser “flat” */
      border: `2px solid ${alpha(t.palette[colorKey].main, 0.25)}`,

      /* ícone com mesma cor do texto */
      '& .MuiSvgIcon-root': { color: t.palette[colorKey].main },

      /* hover: leve wash colorido + realce de borda */
      '&:hover': {
        backgroundColor: alpha('#FFF', 0.9),
        borderColor: t.palette[colorKey].main,
        boxShadow: `0 0 4px ${alpha(t.palette[colorKey].main, 0.35)}`,
      },
    })}
  >
    {label}
  </Button>
)
