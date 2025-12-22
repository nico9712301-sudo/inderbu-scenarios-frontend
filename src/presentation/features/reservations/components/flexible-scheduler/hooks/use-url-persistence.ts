import { ScheduleConfig, IFromTo, URLSchedulerState } from "../types/scheduler.types";
import { useEffect, useCallback, useRef, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";



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
  const hasRestoredFromURL = useRef(false);

  // Construir estado de URL desde el estado actual
  // IMPORTANTE: Solo sincronizar fechas y weekdays, NO los timeslots seleccionados
  // para evitar re-renders innecesarios del servidor que causan scroll al inicio
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
  }, [config.hasDateRange, config.hasWeekdaySelection, dateRange.from, dateRange.to, selectedWeekdays]);

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
  // Diferir la actualización usando requestAnimationFrame para evitar scroll reset
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

    // Construir nueva URL
    const newURL = params.toString() ? `?${params.toString()}` : '';
    const currentPath = window.location.pathname;
    const fullURL = `${currentPath}${newURL}`;

    // Guardar la posición del scroll antes de actualizar
    const scrollY = window.scrollY;

    // Diferir la actualización usando requestAnimationFrame para evitar scroll reset
    requestAnimationFrame(() => {
      startTransition(() => {
        router.replace(fullURL, { scroll: false });
        
        // Restaurar la posición del scroll después de la actualización
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
      });
    });
  }, [router, searchParams]);

  // Restaurar estado desde URL al montar
  useEffect(() => {
    if (!isInitialMount.current) return;

    const urlState = parseURLState();

    // Preparar configuración de fechas con fallback a hoy si no hay fecha en URL
    const restoredDateRange: IFromTo = {
      from: urlState.date, // Will be undefined if no date in URL
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

    // SIEMPRE aplicar estado restaurado (incluso si es undefined para permitir fallback)
    onRestoreDateRange(restoredDateRange);
    onRestoreConfig(restoredConfig);

    if (restoredWeekdays.length > 0) {
      onRestoreWeekdays(restoredWeekdays);
    }

    isInitialMount.current = false;
    hasRestoredFromURL.current = true;
  }, []); // Solo al montar

  // Sincronizar estado a URL cuando cambie (pero no en el mount inicial)
  // Usar useRef para comparar valores previos y evitar actualizaciones innecesarias
  const prevStateRef = useRef<{ date?: string; endDate?: string; mode?: string; weekdays?: string }>({});
  
  useEffect(() => {
    if (isInitialMount.current) return;
    
    const urlState = buildURLState();
    
    // Comparar con el estado previo para evitar actualizaciones innecesarias
    const prevState = prevStateRef.current;
    const hasChanged = 
      prevState.date !== urlState.date ||
      prevState.endDate !== urlState.endDate ||
      prevState.mode !== urlState.mode ||
      prevState.weekdays !== urlState.weekdays;
    
    if (hasChanged) {
      prevStateRef.current = { ...urlState };
      updateURL(urlState);
    }
  }, [buildURLState, updateURL]);

  return {
    updateURL: (urlState: URLSchedulerState) => updateURL(urlState),
    parseURLState,
    hasRestoredFromURL: hasRestoredFromURL.current,
  };
};
