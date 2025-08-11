import { useState, useEffect, useCallback, useMemo } from 'react';
import { createReservationRepository } from '@/entities/reservation/infrastructure/reservation-repository.adapter';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';

interface AvailabilityConfiguration {
  subScenarioId: number;
  initialDate: string;
  finalDate?: string;
  weekdays?: number[];
}

interface TimeSlotBasic {
  id: number;
  startTime: string;
  endTime: string;
  isAvailableInAllDates: boolean;
}

interface AvailabilityStats {
  totalDates: number;
  totalTimeslots: number;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  globalAvailabilityPercentage: number;
  datesWithFullAvailability: number;
  datesWithNoAvailability: number;
}

interface SimplifiedAvailabilityResponse {
  subScenarioId: number;
  requestedConfiguration: {
    initialDate: string;
    finalDate?: string;
    weekdays?: number[];
  };
  calculatedDates: string[];
  timeSlots: TimeSlotBasic[];
  stats: AvailabilityStats;
  queriedAt: string;
}

interface UseAvailabilityConfigurationOptions {
  enabled?: boolean;
}

interface UseAvailabilityConfigurationResult {
  data: SimplifiedAvailabilityResponse | null;
  timeSlots: TimeSlotBasic[];
  availableSlotIds: number[];
  calculatedDates: string[];
  stats: AvailabilityStats | null;
  isLoading: boolean;
  error: string | null;
  checkAvailability: (config: AvailabilityConfiguration) => Promise<void>;
  checkSlotAvailability: (slotId: number) => boolean;
  getSlotStatus: (slotId: number) => 'available' | 'occupied' | 'unknown';
}

/**
 * Hook para consultar disponibilidad con configuración completa
 * 
 * Características:
 * - Soporta consultas de un día y rangos complejos
 * - Incluye días de semana específicos
 * - Respuesta simplificada optimizada para UI
 * - Consistente con la API de creación de reservas
 * 
 * @param options Configuración del hook
 * @returns Estado y funciones para manejar disponibilidad
 */
export function useAvailabilityConfiguration(
  options: UseAvailabilityConfigurationOptions = {}
): UseAvailabilityConfigurationResult {
  const { enabled = true } = options;
  
  const [data, setData] = useState<SimplifiedAvailabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memoizar repository CON autenticación
  const repository = useMemo(() => {
    const httpClient = ClientHttpClientFactory.createClientWithAuth();
    return createReservationRepository(httpClient);
  }, []);

  // Función principal para consultar disponibilidad
  const checkAvailability = useCallback(async (config: AvailabilityConfiguration) => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Checking availability for configuration:`, config);
      
      const result = await repository.getAvailabilityForConfiguration(config);
      
      console.log(`Availability result:`, result);
      
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format from availability API');
      }
      
      setData(result);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al consultar disponibilidad';
      console.error(`Error checking availability:`, err);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, repository]);

  // Helpers memoizados derivados de la respuesta
  const timeSlots = useMemo(() => {
    return data?.timeSlots || [];
  }, [data]);

  const availableSlotIds = useMemo(() => {
    return timeSlots
      .filter(slot => slot.isAvailableInAllDates)
      .map(slot => slot.id);
  }, [timeSlots]);

  const calculatedDates = useMemo(() => {
    return data?.calculatedDates || [];
  }, [data]);

  const stats = useMemo(() => {
    return data?.stats || null;
  }, [data]);

  // Helper para obtener el estado de un slot
  const getSlotStatus = useCallback((slotId: number): 'available' | 'occupied' | 'unknown' => {
    if (isLoading) return 'unknown';
    const slot = timeSlots.find(t => t.id === slotId);
    if (!slot) return 'unknown';
    return slot.isAvailableInAllDates ? 'available' : 'occupied';
  }, [timeSlots, isLoading]);

  // Helper para verificar si un slot específico está disponible
  const checkSlotAvailability = useCallback((slotId: number): boolean => {
    return availableSlotIds.includes(slotId);
  }, [availableSlotIds]);

  return {
    data,
    timeSlots,
    availableSlotIds,
    calculatedDates,
    stats,
    isLoading,
    error,
    checkAvailability,
    checkSlotAvailability,
    getSlotStatus,
  };
}

/**
 * Hook simplificado para consultas de configuración específica
 */
export function useSimpleAvailabilityConfiguration(
  config: AvailabilityConfiguration | null,
  options: UseAvailabilityConfigurationOptions = {}
) {
  const { 
    availableSlotIds, 
    timeSlots, 
    calculatedDates, 
    stats, 
    isLoading, 
    error, 
    checkAvailability 
  } = useAvailabilityConfiguration(options);
  
  // Auto-consultar cuando cambie la configuración
  const [lastConfig, setLastConfig] = useState<string | null>(null);
  
  useEffect(() => {
    if (!config) return;
    
    const configKey = JSON.stringify(config);
    if (configKey !== lastConfig) {
      setLastConfig(configKey);
      checkAvailability(config);
    }
  }, [config, lastConfig, checkAvailability]);
  
  return { 
    availableSlotIds, 
    timeSlots, 
    calculatedDates, 
    stats, 
    isLoading, 
    error 
  };
}
