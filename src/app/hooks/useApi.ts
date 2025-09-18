'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';

export function useApi<T = unknown>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    apiFetch<T>(url, { signal: controller.signal })
      .then((res) => {
        if (!mounted) return;
        setData(res as T);
      })
      .catch((err: unknown) => {
        // ignore aborts, log others
        const maybeErr = err as { name?: string } | undefined;
        if (maybeErr?.name !== "AbortError") {
          console.error(err);
        }
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [url]);

  return { data, loading };
}
