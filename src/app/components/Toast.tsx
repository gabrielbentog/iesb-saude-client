import { toast, ToastContainer, ToastContainerProps } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Tipos para definir o tipo de Toast (success ou error)
type ToastType = 'success' | 'error';

// Definindo as opções do Toast com base no React Toastify
import { ToastPosition } from 'react-toastify';

const toastOptions = {
  position: "top-right" as ToastPosition,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light" as const,
};

// Função para exibir o Toast com base no tipo
export const showToast = (message: string, type: ToastType) => {
  if (type === 'success') {
    toast.success(message, toastOptions);
  } else {
    toast.error(message, toastOptions);
  }
};


