"use client";

import { useCallback, useState } from "react";
import { useAsyncExport } from "@/shared/hooks/use-async-export";
import { 
  startSubScenariosExportAction, 
  checkSubScenarioExportStatusAction 
} from "@/application/dashboard/sub-scenarios/actions/ExportActions";

export interface ExportSubScenariosOptions {
  format?: 'xlsx' | 'csv';
  filters?: {
    active?: boolean;
    scenarioId?: number;
    activityAreaId?: number;
    search?: string;
  };
  includeFields?: string[];
}

interface UseSubScenariosExportProps {
  defaultOptions?: ExportSubScenariosOptions;
}

/**
 * Hook for exporting sub-scenarios with async job handling
 * Provides non-blocking export with progress tracking
 */
export function useSubScenariosExport({ defaultOptions = {} }: UseSubScenariosExportProps = {}) {
  
  // State for current export options
  const [currentOptions, setCurrentOptions] = useState<ExportSubScenariosOptions>(defaultOptions);

  // Start export function
  const handleStartExport = useCallback(async () => {
    const payload = {
      format: currentOptions.format || 'xlsx',
      filters: currentOptions.filters || {},
      includeFields: currentOptions.includeFields || [
        'id', 'name', 'description', 'active', 'scenario.name', 'activityArea.name', 'createdAt'
      ],
    };

    const result = await startSubScenariosExportAction(payload);
    
    if (!result.success || !result.jobId) {
      throw new Error(result.error || 'Failed to start sub-scenario export');
    }

    return { jobId: result.jobId };
  }, [currentOptions]);

  // Check status function  
  const handleCheckStatus = useCallback(async (jobId: string) => {
    const result = await checkSubScenarioExportStatusAction(jobId);
    
    if (!result.success || !result.job) {
      throw new Error(result.error || 'Failed to check sub-scenario export status');
    }

    return result.job;
  }, []);

  const asyncExport = useAsyncExport({
    onStartExport: handleStartExport,
    onCheckStatus: handleCheckStatus,
    // Remove onDownload - let useAsyncExport handle it with the default implementation
    pollingInterval: 3000, // Check every 3 seconds
    maxRetries: 20, // 1 minute timeout
  });

  // Export with specific format
  const exportAsExcel = useCallback((options?: Omit<ExportSubScenariosOptions, 'format'>) => {
    const mergedOptions = { ...defaultOptions, ...options, format: 'xlsx' as const };
    setCurrentOptions(mergedOptions);
    return asyncExport.startExport();
  }, [defaultOptions, asyncExport.startExport]);

  const exportAsCsv = useCallback((options?: Omit<ExportSubScenariosOptions, 'format'>) => {
    const mergedOptions = { ...defaultOptions, ...options, format: 'csv' as const };
    setCurrentOptions(mergedOptions);
    return asyncExport.startExport();
  }, [defaultOptions, asyncExport.startExport]);

  // Export with current filters
  const exportWithFilters = useCallback((filters: ExportSubScenariosOptions['filters'], format: 'xlsx' | 'csv' = 'xlsx') => {
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