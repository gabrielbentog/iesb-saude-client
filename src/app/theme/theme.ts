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

// ========== TEMA ESCURO (Adaptado) ==========
export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#E50839',
      light: '#FF6371',
      dark: '#AB062D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#90A4AE',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    divider: '#333333',
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
