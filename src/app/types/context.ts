import type { ReactNode } from 'react';
import type { AlertColor } from '@mui/material';

export interface Toast {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export interface ToastOptions {
  message: string;
  severity?: AlertColor;
}

export interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

export interface AnchorOrigin {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}

export interface ToastProviderProps {
  children: ReactNode;
  anchorOrigin?: AnchorOrigin;
}

export interface ThemeContextProps {
  toggleTheme: () => void;
  isDark: boolean;
  // preferência atual: 'system'|'light'|'dark'
  themePreference: 'system' | 'light' | 'dark';
  setThemePreference: (p: 'system' | 'light' | 'dark') => void;
}
