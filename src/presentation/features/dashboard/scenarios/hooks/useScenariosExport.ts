"use client";

import { useCallback, useState } from "react";
import { useAsyncExport } from "@/shared/hooks/use-async-export";
import { 
  startScenariosExportAction, 
  checkExportStatusAction, 
  getExportDownloadUrlAction 
} from "@/application/dashboard/scenarios/actions/ExportActions";

export interface ExportScenariosOptions {
  format?: 'xlsx' | 'csv';
  filters?: {
    active?: boolean;
    neighborhoodId?: number;
    search?: string;
  };
  includeFields?: string[];
}

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
    const payload = {
      format: currentOptions.format || 'xlsx',
      filters: currentOptions.filters || {},
      includeFields: currentOptions.includeFields || [
        'id', 'name', 'address', 'active', 'neighborhood.name', 'createdAt'
      ],
    };

    const result = await startScenariosExportAction(payload);
    
    if (!result.success || !result.jobId) {
      throw new Error(result.error || 'Failed to start export');
    }

    return { jobId: result.jobId };
  }, [currentOptions]);

  // Check status function  
  const handleCheckStatus = useCallback(async (jobId: string) => {
    const result = await checkExportStatusAction(jobId);
    
    if (!result.success || !result.job) {
      throw new Error(result.error || 'Failed to check export status');
    }

    return result.job;
  }, []);

  // Download function
  const handleDownload = useCallback(async (jobId: string) => {
    const result = await getExportDownloadUrlAction(jobId);
    
    if (!result.success || !result.downloadUrl || !result.fileName) {
      throw new Error(result.error || 'Failed to get download URL');
    }

    return { 
      downloadUrl: result.downloadUrl, 
      fileName: result.fileName 
    };
  }, []);

  const asyncExport = useAsyncExport({
    onStartExport: handleStartExport,
    onCheckStatus: handleCheckStatus,
    onDownload: handleDownload,
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
