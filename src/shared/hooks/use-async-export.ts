"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
  createdAt: string;
  estimatedTime?: number; // seconds
}

interface UseAsyncExportProps {
  onStartExport: () => Promise<{ jobId: string }>;
  onCheckStatus: (jobId: string) => Promise<ExportJob>;
  onDownload?: (url: string, fileName: string) => void;
  pollingInterval?: number;
  maxRetries?: number;
}

/**
 * Hook for managing asynchronous export operations
 * Provides non-blocking exports with progress tracking and auto-download
 */
export function useAsyncExport({
  onStartExport,
  onCheckStatus,
  onDownload,
  pollingInterval = 3000,
  maxRetries = 20,
}: UseAsyncExportProps) {
  const [currentJob, setCurrentJob] = useState<ExportJob | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retriesRef = useRef(0);
  const toastIdRef = useRef<string | number | null>(null);

  // Auto-download function
  const triggerDownload = useCallback(async (url: string, fileName: string) => {
    console.log('🔽 Triggering download:', { url, fileName });
    
    if (onDownload) {
      onDownload(url, fileName);
    } else {
      try {
        // Para URLs de API, necesitamos hacer fetch con autenticación
        if (url.startsWith('/api/')) {
          console.log('🔐 API download detected, using fetch with auth');
          
          const response = await fetch(url, {
            method: 'GET',
            credentials: 'include', // Incluir cookies de auth
          });
          
          if (!response.ok) {
            throw new Error(`Download failed: ${response.status}`);
          }
          
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileName;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Limpiar objeto URL
          window.URL.revokeObjectURL(downloadUrl);
          console.log('✅ Download completed successfully');
        } else {
          // Para URLs externas, usar el método tradicional
          console.log('🌐 External URL detected, using direct link');
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error('❌ Download failed:', error);
        throw error;
      }
    }
  }, [onDownload]);

  // Update toast based on job status
  const updateToast = useCallback((job: ExportJob) => {
    switch (job.status) {
      case 'pending':
        toastIdRef.current = toast.loading("Preparando exportación...", {
          description: "Tu archivo se está preparando en segundo plano",
        });
        break;
      
      case 'processing':
        const progress = job.progress || 0;
        const progressText = progress > 0 ? ` ${Math.round(progress)}%` : '';
        const timeText = job.estimatedTime ? ` (~${job.estimatedTime}s restantes)` : '';
        
        if (toastIdRef.current) {
          toast.loading(`Exportando datos...${progressText}`, {
            id: toastIdRef.current,
            description: `Procesando tu archivo${timeText}`,
          });
        }
        break;
      
      case 'completed':
        if (toastIdRef.current) {
          toast.success("¡Exportación completada!", {
            id: toastIdRef.current,
            description: "Tu archivo se descargará automáticamente",
            duration: 5000,
          });
        }
        
        if (job.downloadUrl && job.fileName) {
          // Small delay to show success toast, then trigger download
          setTimeout(async () => {
            try {
              await triggerDownload(job.downloadUrl!, job.fileName!);
            } catch (error) {
              console.error('Failed to trigger download:', error);
              toast.error("Error al descargar archivo", {
                description: "No se pudo descargar el archivo. Intenta nuevamente.",
              });
            }
          }, 500);
        }
        break;
      
      case 'failed':
        if (toastIdRef.current) {
          toast.error("Error en la exportación", {
            id: toastIdRef.current,
            description: job.error || "No se pudo completar la exportación",
            duration: 8000,
          });
        }
        break;
    }
  }, [triggerDownload]);

  // Start polling job status
  const startPolling = useCallback((jobId: string) => {
    retriesRef.current = 0;
    
    const poll = async () => {
      try {
        const job = await onCheckStatus(jobId);
        setCurrentJob(job);
        updateToast(job);

        if (job.status === 'completed' || job.status === 'failed') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsExporting(false);
          
          if (job.status === 'failed') {
            setError(job.error || 'Export failed');
          }
          return;
        }

        retriesRef.current++;
        if (retriesRef.current >= maxRetries) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsExporting(false);
          setError('Export timeout - too many retries');
          toast.error("Tiempo de espera agotado", {
            description: "La exportación está tomando más tiempo del esperado",
          });
        }
      } catch (error: any) {
        console.error('Polling error:', error);
        retriesRef.current++;
        
        if (retriesRef.current >= maxRetries) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsExporting(false);
          setError(error.message || 'Polling failed');
        }
      }
    };

    // Initial poll
    poll();
    
    // Set up interval
    pollingIntervalRef.current = setInterval(poll, pollingInterval);
  }, [onCheckStatus, updateToast, pollingInterval, maxRetries]);

  // Start export
  const startExport = useCallback(async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setError(null);
      setCurrentJob(null);
      
      const { jobId } = await onStartExport();
      startPolling(jobId);
    } catch (error: any) {
      console.error('Start export error:', error);
      setIsExporting(false);
      setError(error.message || 'Failed to start export');
      toast.error("Error al iniciar exportación", {
        description: error.message || "No se pudo iniciar la exportación",
      });
    }
  }, [isExporting, onStartExport, startPolling]);

  // Cancel export (cleanup)
  const cancelExport = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsExporting(false);
    setCurrentJob(null);
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    isExporting,
    currentJob,
    error,
    progress: currentJob?.progress || 0,
    
    // Actions
    startExport,
    cancelExport,
    
    // Status checks
    canExport: !isExporting,
    isCompleted: currentJob?.status === 'completed',
    isFailed: currentJob?.status === 'failed',
  };
}