import { useRouter } from "next/navigation";
import NProgress from "nprogress";

export function usePushWithProgress() {
  const router = useRouter();

  const pushWithProgress = (url: string) => {
    // Inicia a barra de progresso imediatamente
    NProgress.start();
    // Navega para a nova rota
    router.push(url);
  };

  return pushWithProgress;
}
