"use server";

import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { ExportJob } from '@/shared/hooks/use-async-export';


export interface ExportSubScenariosPayload {
  format: 'xlsx' | 'csv';
  filters: {
    active?: boolean;
    scenarioId?: number;
    activityAreaId?: number;
    search?: string;
  };
  includeFields: string[];
}

/**
 * Start async export job for sub-scenarios
 */
export async function startSubScenariosExportAction(
  payload: ExportSubScenariosPayload
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);
    
    const response = await httpClient.post<{
      statusCode: number;
      message: string;
      data: { jobId: string; status: string; message: string };
    }>('/sub-scenarios/export', payload);
    
    console.log('Sub-scenario export job started:', response);
    return { success: true, jobId: response.data.jobId };
  } catch (error: any) {
    console.error('Error starting sub-scenarios export:', error);
    return { 
      success: false, 
      error: error.message || "Error al iniciar la exportación" 
    };
  }
}

/**
 * Check sub-scenario export job status
 */
export async function checkSubScenarioExportStatusAction(
  jobId: string
): Promise<{ success: boolean; job?: ExportJob; error?: string }> {
  try {
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    const response = await httpClient.get<any>(`/sub-scenarios/export/${jobId}/status`);
    console.log('Sub-scenario export status response:', JSON.stringify(response, null, 2));

    // Construir downloadUrl usando el endpoint /file cuando esté completed
    const isCompleted = response.status === 'completed' || response.data?.status === 'completed';
    const downloadUrl = isCompleted ? `/sub-scenarios/export/${jobId}/file` : undefined;

    const job: ExportJob = {
      id: jobId,
      status: response.status || response.data?.status || 'pending',
      progress: response.progress || response.data?.progress,
      downloadUrl: downloadUrl,
      fileName: response.fileName || response.data?.fileName || `sub_escenarios_export.xlsx`,
      error: response.error || response.data?.error,
      createdAt: response.createdAt || response.data?.createdAt || new Date().toISOString(),
      estimatedTime: response.estimatedTime || response.data?.estimatedTime,
    };

    console.log('🎯 Constructed sub-scenario job:', JSON.stringify(job, null, 2));

    return { success: true, job };
  } catch (error: any) {
    console.error('Error checking sub-scenario export status:', error);
    return { 
      success: false, 
      error: error.message || "Error al verificar el estado de la exportación" 
    };
  }
}

/**
 * Get download URL for completed sub-scenario export
 */
export async function getSubScenarioExportDownloadUrlAction(
  jobId: string
): Promise<{ success: boolean; downloadUrl?: string; fileName?: string; error?: string }> {
  try {
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    console.log('CLIENT: Getting download URL for sub-scenario job:', jobId);
    

    const response = await httpClient.get<{ downloadUrl: string; fileName: string }>(
      `/sub-scenarios/export/${jobId}/download`
    );

    console.log('Sub-scenario download URL response:', response);

    return { 
      success: true, 
      downloadUrl: response.downloadUrl, 
      fileName: response.fileName 
    };
  } catch (error: any) {
    console.error('Error getting sub-scenario download URL:', error);
    return { 
      success: false, 
      error: error.message || "Error al obtener el enlace de descarga" 
    };
  }
}