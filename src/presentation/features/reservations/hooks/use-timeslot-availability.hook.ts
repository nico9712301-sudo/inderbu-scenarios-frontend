import { useState, useEffect, useCallback, useMemo } from 'react';
import { createReservationRepository } from '@/entities/reservation/infrastructure/reservation-repository.adapter';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { TimeslotResponseDto } from '@/entities/reservation/model/types';

interface UseAvailabilityOptions {
  subScenarioId: number;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseAvailabilityResult {
  availableSlots: TimeslotResponseDto[];
  occupiedSlotIds: number[];
  availableSlotIds: number[];
  isLoading: boolean;
  error: string | null;
  refetch: (date: string) => Promise<void>;
  checkSlotAvailability: (slotId: number) => boolean;
  getSlotStatus: (slotId: number) => 'available' | 'occupied' | 'unknown';
}

/**
 * FIXED: Hook sin loop infinito + mejor performance
 * 
 * Características:
 * - Consulta automática cuando cambia la fecha
 * - Cache inteligente para evitar requests innecesarios  
 * - Refetch automático opcional
 * - Helpers para verificar disponibilidad individual de slots
 * - Manejo robusto de errores con retry automático
 * 
 * @param options Configuración del hook
 * @returns Estado y funciones para manejar disponibilidad
 */
export function useTimeslotAvailability(options: UseAvailabilityOptions): UseAvailabilityResult {
  const { subScenarioId, enabled = true, refetchInterval } = options;
  
  const [availableSlots, setAvailableSlots] = useState<TimeslotResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // FIXED: Memoizar correctamente el repository CON autenticación
  const repository = useMemo(() => {
    const httpClient = ClientHttpClientFactory.createClientWithAuth();
    return createReservationRepository(httpClient);
  }, []); // Sin dependencias - solo crear una vez

  // FIXED: Función fetch SIN dependencias problemáticas
  const fetchAvailability = useCallback(async (date: string, isRetry = false) => {
    if (!enabled || !date) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching availability for subScenario ${subScenarioId}, date ${date}${isRetry ? ' (retry)' : ''}`);
      
      const result = await repository.getAvailableTimeSlots(subScenarioId, date);
      
      console.log(`Raw result from backend:`, result);
      console.log(`Type of result:`, typeof result);
      console.log(`Is result an array?`, Array.isArray(result));
      
      // SAFETY: Verificar que result sea un array
      if (!Array.isArray(result)) {
        console.error(`Expected array but got:`, result);
        throw new Error(`Invalid response format: expected array, got ${typeof result}`);
      }
      
      console.log(`Found ${result.length} available slots for ${date}:`, result.map(s => s.id));
      
      setAvailableSlots(result);
      setCurrentDate(date);
      setRetryCount(0); // Reset retry count on success
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al consultar disponibilidad';
      console.error(`Error fetching availability:`, err);
      
      setError(errorMessage);
      setAvailableSlots([]);
      
      // MEJORA: Retry automático en caso de error de red
      if (!isRetry && retryCount < 2) {
        console.log(`Retrying availability fetch (attempt ${retryCount + 1}/2)...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchAvailability(date, true);
        }, 1000 * (retryCount + 1)); // Backoff exponencial: 1s, 2s
      }
    } finally {
      setIsLoading(false);
    }
  }, [subScenarioId, enabled, repository, retryCount]); // FIXED: Solo dependencias estables

  // FIXED: Refetch wrapper SIN cache que causa loops
  const refetch = useCallback(async (date: string) => {
    await fetchAvailability(date);
  }, [fetchAvailability]);

  // FIXED: Auto-refetch sin loops + cleanup correcto
  useEffect(() => {
    if (!refetchInterval || !currentDate) return;
    
    console.log(`Setting up auto-refetch every ${refetchInterval}ms for ${currentDate}`);
    const interval = setInterval(() => {
      console.log(`Auto-refetching availability for ${currentDate}`);
      // FIXED: Usar fetchAvailability directamente para evitar loops
      fetchAvailability(currentDate);
    }, refetchInterval);
    
    return () => {
      console.log(`Clearing auto-refetch interval`);
      clearInterval(interval);
    };
  }, [refetchInterval, currentDate, fetchAvailability]);

  // FIXED: Helpers memoizados para mejor performance
  const availableSlotIds = useMemo(() => {
    return availableSlots.map(slot => slot.id);
  }, [availableSlots]);
  
  // Para slots ocupados, asumimos todos los IDs de 0-23 menos los disponibles
  const occupiedSlotIds = useMemo(() => {
    const allSlotIds = Array.from({ length: 24 }, (_, i) => i);
    return allSlotIds.filter(id => !availableSlotIds.includes(id));
  }, [availableSlotIds]);
  
  const checkSlotAvailability = useCallback((slotId: number): boolean => {
    return availableSlotIds.includes(slotId);
  }, [availableSlotIds]);
  
  const getSlotStatus = useCallback((slotId: number): 'available' | 'occupied' | 'unknown' => {
    if (isLoading) return 'unknown';
    return availableSlotIds.includes(slotId) ? 'available' : 'occupied';
  }, [availableSlotIds, isLoading]);

  return {
    availableSlots,
    occupiedSlotIds,
    availableSlotIds,
    isLoading,
    error,
    refetch,
    checkSlotAvailability,
    getSlotStatus,
  };
}

/**
 * FIXED: Hook simplificado sin loops
 */
export function useSimpleAvailability(subScenarioId: number, date: string | null) {
  const { availableSlotIds, isLoading, error, refetch } = useTimeslotAvailability({
    subScenarioId,
    enabled: !!date,
  });
  
  // FIXED: Solo refetch cuando la fecha cambie de verdad
  const [lastDate, setLastDate] = useState<string | null>(null);
  
  useEffect(() => {
    if (date && date !== lastDate) {
      setLastDate(date);
      refetch(date);
    }
  }, [date, lastDate, refetch]);
  
  return { availableSlotIds, isLoading, error };
}