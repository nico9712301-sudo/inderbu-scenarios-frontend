"use server";

import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { ExportJob } from '@/shared/hooks/use-async-export';


export interface ExportScenariosPayload {
  format: 'xlsx' | 'csv';
  filters: {
    active?: boolean;
    neighborhoodId?: number;
    search?: string;
  };
  includeFields: string[];
}

/**
 * Start async export job
 */
export async function startScenariosExportAction(
  payload: ExportScenariosPayload
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);
    
    const response = await httpClient.post<{
      statusCode: number;
      message: string;
      data: { jobId: string; status: string; message: string };
    }>('/scenarios/export', payload);
    
    console.log('Export job started:', response);
    return { success: true, jobId: response.data.jobId };
  } catch (error: any) {
    console.error('Error starting scenarios export:', error);
    return { 
      success: false, 
      error: error.message || "Error al iniciar la exportación" 
    };
  }
}

/**
 * Check export job status
 */
export async function checkExportStatusAction(
  jobId: string
): Promise<{ success: boolean; job?: ExportJob; error?: string }> {
  try {
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    const response = await httpClient.get<any>(`/scenarios/export/${jobId}/status`);
    console.log('Export status response:', JSON.stringify(response, null, 2));

    // Construir downloadUrl usando el endpoint /file cuando esté completed
    const isCompleted = response.status === 'completed' || response.data?.status === 'completed';
    const downloadUrl = isCompleted ? `/scenarios/export/${jobId}/file` : undefined;

    const job: ExportJob = {
      id: jobId,
      status: response.status || response.data?.status || 'pending',
      progress: response.progress || response.data?.progress,
      downloadUrl: downloadUrl,
      fileName: response.fileName || response.data?.fileName || `scenarios_export.xlsx`,
      error: response.error || response.data?.error,
      createdAt: response.createdAt || response.data?.createdAt || new Date().toISOString(),
      estimatedTime: response.estimatedTime || response.data?.estimatedTime,
    };

    console.log('🎯 Constructed job:', JSON.stringify(job, null, 2));

    return { success: true, job };
  } catch (error: any) {
    console.error('Error checking export status:', error);
    return { 
      success: false, 
      error: error.message || "Error al verificar el estado de la exportación" 
    };
  }
}

/**
 * Get download URL for completed export
 */
export async function getExportDownloadUrlAction(
  jobId: string
): Promise<{ success: boolean; downloadUrl?: string; fileName?: string; error?: string }> {
  try {
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    const response = await httpClient.get<{ downloadUrl: string; fileName: string }>(
      `/scenarios/export/${jobId}/download`
    );

    return { 
      success: true, 
      downloadUrl: response.downloadUrl, 
      fileName: response.fileName 
    };
  } catch (error: any) {
    console.error('Error getting download URL:', error);
    return { 
      success: false, 
      error: error.message || "Error al obtener el enlace de descarga" 
    };
  }
}
