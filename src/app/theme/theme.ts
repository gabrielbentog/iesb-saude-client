// src/theme/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles'

const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 3,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
}

// ========== TEMA CLARO ==========
export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#E50839',   // vermelho principal
      dark: '#AB062D',   // vermelho mais escuro
      light: '#FF6371',  // vermelho mais claro
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#424242',   // cinza para contrastar com o vermelho
    },
    text: {
      primary: '#1A1A1A', // texto principal (preto suave)
      secondary: '#555555', // texto secundário (cinza)
    },
    divider: '#E0E0E0',
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    info: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    background: {
      default: "#f8fafc",
      paper: '#FFFFFF',   // cartões/painéis
    },
  },
})

// ========== TEMA ESCURO (Adaptado) ==========
export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#E50839',   // vermelho principal
      dark: '#AB062D',
      light: '#FF6371',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#9E9E9E',   // cinza médio
    },
    background: {
      default: '#121212', // cinza quase preto
      paper: '#1E1E1E',   // cinza mais claro para painéis
    },
    text: {
      primary: '#E0E0E0', // cinza claro
      secondary: '#B0B0B0', // cinza médio
    },
    divider: '#2C2C2C',
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
    info: {
      main: '#3b82f6',
    },
  },
});
