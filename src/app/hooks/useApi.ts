'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';

export function useApi<T = any>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<T>(url)
      .then(setData)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading };
}