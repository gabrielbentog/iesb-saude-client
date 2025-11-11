/**
 * Hook para gerenciar cache de dados do calendário por mês
 * Otimiza requisições evitando recarregar meses já visitados
 */

import { useState, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { apiFetch } from '@/app/lib/api';
import type { ApiSlot } from '@/app/types';

interface CalendarApi {
  free: ApiSlot[];
  busy: ApiSlot[];
}

interface CacheEntry {
  data: CalendarApi;
  timestamp: number;
}

interface UseCalendarCacheOptions {
  enabled?: boolean;
  cacheTimeout?: number; // em milissegundos, default: 5 minutos
}

interface UseCalendarCacheReturn {
  data: CalendarApi | null;
  loading: boolean;
  error: Error | null;
  fetchMonth: (date: Date) => Promise<void>;
  clearCache: () => void;
  refetch: () => Promise<void>;
}

/**
 * Hook para cache inteligente de dados do calendário
 * @param options - Opções de configuração
 * @returns Objeto com dados, loading, error e funções de controle
 */
export function useCalendarCache(
  options: UseCalendarCacheOptions = {}
): UseCalendarCacheReturn {
  const { enabled = true, cacheTimeout = 5 * 60 * 1000 } = options; // 5 minutos default

  const [data, setData] = useState<CalendarApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Cache em memória: key = "YYYY-MM", value = { data, timestamp }
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const currentMonthRef = useRef<string>('');

  /**
   * Busca dados do calendário para um mês específico
   * Verifica cache antes de fazer requisição
   */
  const fetchMonth = useCallback(async (date: Date) => {
    if (!enabled) return;

    const monthKey = format(date, 'yyyy-MM');
    currentMonthRef.current = monthKey;

    // Verifica se existe em cache e se não expirou
    const cached = cacheRef.current.get(monthKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < cacheTimeout) {
      // Usa dados do cache
      setData(cached.data);
      setLoading(false);
      setError(null);
      return;
    }

    // Não está em cache ou expirou, faz requisição
    setLoading(true);
    setError(null);

    try {
      // Calcula primeiro e último dia do mês
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const start = format(firstDay, 'yyyy-MM-dd');
      const end = format(lastDay, 'yyyy-MM-dd');

      const response = await apiFetch<CalendarApi>(
        `/api/calendar?start=${start}&end=${end}`
      );

      // Armazena em cache
      cacheRef.current.set(monthKey, {
        data: response,
        timestamp: now,
      });

      setData(response);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao carregar calendário');
      setError(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [enabled, cacheTimeout]);

  /**
   * Limpa todo o cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  /**
   * Recarrega o mês atual forçando nova requisição
   */
  const refetch = useCallback(async () => {
    if (!currentMonthRef.current) return;
    
    // Remove do cache
    cacheRef.current.delete(currentMonthRef.current);
    
    // Reconstrói a data do mês atual
    const [year, month] = currentMonthRef.current.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    
    await fetchMonth(date);
  }, [fetchMonth]);

  return {
    data,
    loading,
    error,
    fetchMonth,
    clearCache,
    refetch,
  };
}
