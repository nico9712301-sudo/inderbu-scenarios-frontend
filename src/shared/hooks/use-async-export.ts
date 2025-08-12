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
  pollingInterval = 3000, // Aumentado de 300ms a 3s para reducir carga
  maxRetries = 20,
}: UseAsyncExportProps) {
  const [currentJob, setCurrentJob] = useState<ExportJob | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retriesRef = useRef(0);
  const toastIdRef = useRef<string | number | null>(null);
  const isUnmountedRef = useRef(false);

  // Auto-download function
  const triggerDownload = useCallback(async (url: string, fileName: string) => {
    console.log('Triggering download:', { url, fileName });
    
    if (onDownload) {
      onDownload(url, fileName);
    } else {
      try {
        // Para URLs relativas (que son de nuestra API), usar fetch con auth
        if (url.startsWith('/')) {
          console.log('Relative API URL detected, using fetch with auth');
          
          // Construir la URL completa
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const fullUrl = `${baseUrl}${url}`;
          
          console.log('Full download URL:', fullUrl);
          
          const response = await fetch(fullUrl, {
            method: 'GET',
            credentials: 'include', // Incluir cookies de auth
            headers: {
              'Accept': '*/*'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
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
          console.log('Download completed successfully');
        } else {
          // Para URLs externas absolutas, usar el método tradicional
          console.log('External absolute URL detected, using direct link');
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error('Download failed:', error);
        throw error;
      }
    }
  }, [onDownload]);

  // Update toast based on job status
  const updateToast = useCallback((job: ExportJob) => {
    // No actualizar toast si el componente se desmontó
    if (isUnmountedRef.current) return;
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
          console.log("Job completed and the downloadUrl is:", job.downloadUrl);
          
          setTimeout(async () => {
            try {
              await triggerDownload(job.downloadUrl!, job.fileName!);
            } catch (error) {
              console.error('Failed to trigger download:', error);
              if (!isUnmountedRef.current) {
                toast.error("Error al descargar archivo", {
                  description: "No se pudo descargar el archivo. Intenta nuevamente.",
                });
              }
            }
          }, 100);
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

  // Función para limpiar el polling de manera segura
  const clearPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Start polling job status
  const startPolling = useCallback((jobId: string) => {
    // Limpiar cualquier polling anterior
    clearPolling();
    retriesRef.current = 0;
    
    const poll = async () => {
      // No hacer polling si el componente se desmontó
      if (isUnmountedRef.current) {
        clearPolling();
        return;
      }
      try {
        console.log(`Polling job ${jobId}, retry ${retriesRef.current}`);
        const job: ExportJob = await onCheckStatus(jobId);
        
        // Verificar nuevamente por si se desmontó durante el await
        if (isUnmountedRef.current) {
          clearPolling();
          return;
        }
        
        setCurrentJob(job);
        updateToast(job);

        if (job.status === 'completed' || job.status === 'failed') {
          console.log(`Job ${jobId} finished with status: ${job.status}`);
          clearPolling();
          setIsExporting(false);
          
          if (job.status === 'failed') {
            setError(job.error || 'Export failed');
          }
          return;
        }

        // Incrementar reintentos solo si aún está en proceso
        retriesRef.current++;
        
        // Verificar límite de reintentos
        if (retriesRef.current >= maxRetries) {
          console.log(`Max retries reached for job ${jobId}`);
          clearPolling();
          setIsExporting(false);
          setError('Export timeout - too many retries');
          
          if (!isUnmountedRef.current) {
            toast.error("Tiempo de espera agotado", {
              description: "La exportación está tomando más tiempo del esperado",
            });
          }
        }
      } catch (error: any) {
        console.error('Polling error:', error);
        
        // No hacer nada si el componente se desmontó
        if (isUnmountedRef.current) {
          clearPolling();
          return;
        }
        
        retriesRef.current++;
        
        if (retriesRef.current >= maxRetries) {
          console.log(`Max retries reached due to errors for job ${jobId}`);
          clearPolling();
          setIsExporting(false);
          setError(error.message || 'Polling failed');
          
          toast.error("Error en la exportación", {
            description: "No se pudo verificar el estado de la exportación",
          });
        }
      }
    };

    // Hacer primera consulta inmediatamente
    poll();
    
    // Configurar intervalo solo si no hemos llegado al límite
    if (retriesRef.current < maxRetries) {
      pollingIntervalRef.current = setInterval(poll, pollingInterval);
    }
  }, [onCheckStatus, updateToast, pollingInterval, maxRetries, clearPolling]);

  // Start export
  const startExport = useCallback(async () => {
    if (isExporting) {
      console.log('Export already in progress, skipping');
      return;
    }
    
    // No permitir exportar si el componente se desmontó por safety check
    if (isUnmountedRef.current) {
      return;
    }

    try {
      console.log('Starting export...');
      setIsExporting(true);
      setError(null);
      setCurrentJob(null);
      
      const { jobId } = await onStartExport();
      
      // Verificar si el componente se desmontó durante el await
      if (isUnmountedRef.current) {
        setIsExporting(false);
        return;
      }
      
      console.log('Export started with jobId:', jobId);
      startPolling(jobId);
    } catch (error: any) {
      console.error('Start export error:', error);
      
      // No mostrar errores si el componente se desmontó
      if (isUnmountedRef.current) {
        return;
      }
      
      setIsExporting(false);
      setError(error.message || 'Failed to start export');
      toast.error("Error al iniciar exportación", {
        description: error.message || "No se pudo iniciar la exportación",
      });
    }
  }, [isExporting, onStartExport, startPolling]);

  // Cancel export (cleanup)
  const cancelExport = useCallback(() => {
    console.log('Cancelling export...');
    clearPolling();
    setIsExporting(false);
    setCurrentJob(null);
    setError(null);
    
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  }, [clearPolling]);

  // Cleanup on unmount
  useEffect(() => {
    isUnmountedRef.current = false;
    
    return () => {
      console.log('useAsyncExport cleanup - component unmounting');
      isUnmountedRef.current = true;
      
      // Limpiar intervalo
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      // Limpiar toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
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