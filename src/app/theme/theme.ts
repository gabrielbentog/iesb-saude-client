// src/theme/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles'

const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
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
    background: {
      default: '#F9F9F9', // fundo claro
      paper: '#FFFFFF',   // cartões/painéis
    },
    text: {
      primary: '#1A1A1A', // texto principal (preto suave)
      secondary: '#555555', // texto secundário (cinza)
    },
    divider: '#E0E0E0',
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FF9800',
    },
    error: {
      main: '#F44336',
    },
    info: {
      main: '#0288D1',
    },
  },
})

// ========== TEMA ESCURO ==========
export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#E53935',      // vermelho principal (intenso)
      light: '#FF6F60',     // vermelho claro
      dark: '#AB000D',      // vermelho escuro
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#424242',      // cinza para contraste
    },
    background: {
      default: '#0D0D0D',   // fundo quase preto
      paper: '#1A1A1A',     // fundo de cartões/painéis um pouco mais claro
    },
    text: {
      primary: '#FFFFFF',   // texto principal branco
      secondary: '#B0B0B0', // texto secundário cinza claro
    },
    divider: '#2E2E2E',     // divisor cinza
    success: {
      main: '#66BB6A',
    },
    warning: {
      main: '#FFA726',
    },
    error: {
      main: '#F44336',
    },
    info: {
      main: '#29B6F6',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
})
