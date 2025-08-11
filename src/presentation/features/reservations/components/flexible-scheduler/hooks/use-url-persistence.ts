import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback, useRef } from "react";
import { ScheduleConfig, IFromTo, URLSchedulerState } from "../types/scheduler.types";



export const useURLPersistence = (
  config: ScheduleConfig,
  dateRange: IFromTo,
  selectedWeekdays: number[],
  // Callbacks para restaurar estado
  onRestoreConfig: (restoredConfig: Partial<ScheduleConfig>) => void,
  onRestoreDateRange: (restoredRange: IFromTo) => void,
  onRestoreWeekdays: (weekdays: number[]) => void
) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  // Construir estado de URL desde el estado actual
  const buildURLState = useCallback((): URLSchedulerState => {
    const urlState: URLSchedulerState = {};

    // Fecha principal
    if (dateRange.from) {
      urlState.date = dateRange.from;
    }

    // Fecha final (solo si es rango)
    if (config.hasDateRange && dateRange.to) {
      urlState.endDate = dateRange.to;
      urlState.mode = 'range';
    } else if (!config.hasDateRange) {
      urlState.mode = 'single';
    }

    // Días de semana (solo si están seleccionados)
    if (config.hasWeekdaySelection && selectedWeekdays.length > 0) {
      urlState.weekdays = selectedWeekdays.join(',');
    }

    return urlState;
  }, [config, dateRange, selectedWeekdays]);

  // Parsear estado desde URL
  const parseURLState = useCallback((): URLSchedulerState => {
    const urlState: URLSchedulerState = {};

    const date = searchParams.get('date');
    const endDate = searchParams.get('endDate');
    const weekdays = searchParams.get('weekdays');
    const mode = searchParams.get('mode') as 'single' | 'range' | null;

    if (date) urlState.date = date;
    if (endDate) urlState.endDate = endDate;
    if (weekdays) urlState.weekdays = weekdays;
    if (mode) urlState.mode = mode;

    return urlState;
  }, [searchParams]);

  // Actualizar URL cuando cambie el estado
  const updateURL = useCallback((urlState: URLSchedulerState) => {
    const params = new URLSearchParams(searchParams);

    // Limpiar parámetros existentes
    params.delete('date');
    params.delete('endDate');
    params.delete('weekdays');
    params.delete('mode');

    // Agregar nuevos parámetros
    if (urlState.date) params.set('date', urlState.date);
    if (urlState.endDate) params.set('endDate', urlState.endDate);
    if (urlState.weekdays) params.set('weekdays', urlState.weekdays);
    if (urlState.mode) params.set('mode', urlState.mode);

    // Shallow routing para no recargar página
    const newURL = params.toString() ? `?${params.toString()}` : '';
    const currentPath = window.location.pathname;
    router.replace(`${currentPath}${newURL}`, { scroll: false });
  }, [router, searchParams]);

  // Restaurar estado desde URL al montar
  useEffect(() => {
    if (!isInitialMount.current) return;
    
    const urlState = parseURLState();
    
    if (Object.keys(urlState).length === 0) {
      isInitialMount.current = false;
      return; // No hay estado en URL
    }

    console.log('🔄 Restaurando estado desde URL:', urlState);

    // Restaurar configuración de fechas
    const restoredDateRange: IFromTo = {
      from: urlState.date,
      to: urlState.endDate,
    };
    
    const restoredConfig: Partial<ScheduleConfig> = {
      hasDateRange: urlState.mode === 'range',
      hasWeekdaySelection: Boolean(urlState.weekdays),
    };

    // Restaurar días de semana
    const restoredWeekdays = urlState.weekdays 
      ? urlState.weekdays.split(',').map(Number).filter(n => !isNaN(n))
      : [];

    // Aplicar estado restaurado
    if (restoredDateRange.from) {
      onRestoreDateRange(restoredDateRange);
    }
    
    onRestoreConfig(restoredConfig);
    
    if (restoredWeekdays.length > 0) {
      onRestoreWeekdays(restoredWeekdays);
    }

    isInitialMount.current = false;
  }, []); // Solo al montar

  // Sincronizar estado a URL cuando cambie (pero no en el mount inicial)
  useEffect(() => {
    if (isInitialMount.current) return;
    
    const urlState = buildURLState();
    updateURL(urlState);
  }, [buildURLState, updateURL]);

  return {
    updateURL: (urlState: URLSchedulerState) => updateURL(urlState),
    parseURLState,
  };
};
