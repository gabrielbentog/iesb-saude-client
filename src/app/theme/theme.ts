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

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#E50839',
      dark: '#115293',
      light: '#63a4ff',
      contrastText: '#fff',
    },
    secondary: {
      main: '#424242',
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#555555',
    },
    divider: '#e0e0e0',
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    info: {
      main: '#0288d1',
    },
  },
})

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#e53935",          // vermelho intenso
      light: "#ff6f60",         // vermelho claro
      dark: "#ab000d",          // vermelho escuro
      contrastText: "#ffffff",  // texto branco
    },
    secondary: {
      main: "#424242",          // cinza para contrastar com o vermelho
    },
    background: {
      default: "#0d0d0d",       // quase preto
      paper: "#1a1a1a",         // painel um pouco mais claro
    },
    text: {
      primary: "#ffffff",       // texto principal branco
      secondary: "#b0b0b0",     // texto secundário cinza
    },
    divider: "#2e2e2e",       // divisor cinza
    success: {
      main: "#66bb6a",
    },
    warning: {
      main: "#ffa726",
    },
    error: {
      main: "#f44336",
    },
    info: {
      main: "#29b6f6",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

