// contexts/ToastContext.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface Toast {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface ToastOptions {
  message: string;
  severity?: AlertColor;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface AnchorOrigin {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}

interface ToastProviderProps {
  children: ReactNode;
  anchorOrigin?: AnchorOrigin;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children, anchorOrigin }) => {
  const [toast, setToast] = useState<Toast>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = ({ message, severity = 'success' }: ToastOptions) => {
    setToast({ open: true, message, severity });
  };

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        anchorOrigin={anchorOrigin || { vertical: 'top', horizontal: 'right' }} // Usa a posição passada ou o valor padrão
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
