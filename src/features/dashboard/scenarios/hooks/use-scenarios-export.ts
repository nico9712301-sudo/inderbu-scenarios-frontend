"use client";

import { useCallback, useState } from "react";
import { useAsyncExport } from "@/shared/hooks/use-async-export";
import { ScenariosExportService, ExportScenariosOptions } from "../services/export.service";

interface UseScenariosExportProps {
  defaultOptions?: ExportScenariosOptions;
}

/**
 * Hook for exporting scenarios with async job handling
 * Provides non-blocking export with progress tracking
 */
export function useScenariosExport({ defaultOptions = {} }: UseScenariosExportProps = {}) {
  
  // State for current export options
  const [currentOptions, setCurrentOptions] = useState<ExportScenariosOptions>(defaultOptions);

  // Start export function
  const handleStartExport = useCallback(async () => {
    return await ScenariosExportService.startExport(currentOptions);
  }, [currentOptions]);

  // Check status function  
  const handleCheckStatus = useCallback(async (jobId: string) => {
    return await ScenariosExportService.checkExportStatus(jobId);
  }, []);

  const asyncExport = useAsyncExport({
    onStartExport: handleStartExport,
    onCheckStatus: handleCheckStatus,
    // NO custom onDownload - usar el default que maneja autenticación
    pollingInterval: 3000, // Check every 3 seconds
    maxRetries: 20, // 1 minute timeout
  });

  // Export with specific format
  const exportAsExcel = useCallback((options?: Omit<ExportScenariosOptions, 'format'>) => {
    const mergedOptions = { ...defaultOptions, ...options, format: 'xlsx' as const };
    setCurrentOptions(mergedOptions);
    return asyncExport.startExport();
  }, [defaultOptions, asyncExport.startExport]);

  const exportAsCsv = useCallback((options?: Omit<ExportScenariosOptions, 'format'>) => {
    const mergedOptions = { ...defaultOptions, ...options, format: 'csv' as const };
    setCurrentOptions(mergedOptions);
    return asyncExport.startExport();
  }, [defaultOptions, asyncExport.startExport]);

  // Export with current filters
  const exportWithFilters = useCallback((filters: ExportScenariosOptions['filters'], format: 'xlsx' | 'csv' = 'xlsx') => {
    const mergedOptions = { ...defaultOptions, filters, format };
    setCurrentOptions(mergedOptions);
    return asyncExport.startExport();
  }, [defaultOptions, asyncExport.startExport]);

  return {
    // From useAsyncExport
    ...asyncExport,
    
    // Specific export methods
    exportAsExcel,
    exportAsCsv,
    exportWithFilters,
    
    // Status helpers
    statusText: getExportStatusText(asyncExport.currentJob?.status),
    progressText: asyncExport.currentJob?.progress ? `${Math.round(asyncExport.currentJob.progress)}%` : undefined,
  };
}

// Helper function for status text
function getExportStatusText(status?: string): string {
  switch (status) {
    case 'pending': return 'Preparando...';
    case 'processing': return 'Exportando...';
    case 'completed': return 'Completado';
    case 'failed': return 'Error';
    default: return '';
  }
}