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
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      dark: '#5d99c6',
      light: '#e3f2fd',
      contrastText: '#000',
    },
    secondary: {
      main: '#ce93d8',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
    divider: '#333',
    success: {
      main: '#81c784',
    },
    warning: {
      main: '#ffb74d',
    },
    error: {
      main: '#ef5350',
    },
    info: {
      main: '#4fc3f7',
    },
  },
})
