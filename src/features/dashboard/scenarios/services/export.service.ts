import { ExportJob } from '@/shared/hooks/use-async-export';
import { 
  startScenariosExportAction, 
  checkExportStatusAction, 
  getExportDownloadUrlAction 
} from '../actions/export.actions';

export interface ExportScenariosOptions {
  format?: 'xlsx' | 'csv';
  filters?: {
    active?: boolean;
    neighborhoodId?: number;
    search?: string;
  };
  includeFields?: string[];
}

export class ScenariosExportService {
  
  /**
   * Start async export job
   */
  static async startExport(options: ExportScenariosOptions = {}): Promise<{ jobId: string }> {
    const payload = {
      format: options.format || 'xlsx',
      filters: options.filters || {},
      includeFields: options.includeFields || [
        'id', 'name', 'address', 'active', 'neighborhood.name', 'createdAt'
      ],
    };

    const result = await startScenariosExportAction(payload);
    
    if (!result.success || !result.jobId) {
      throw new Error(result.error || 'Failed to start export');
    }

    return { jobId: result.jobId };
  }

  /**
   * Check export job status
   */
  static async checkExportStatus(jobId: string): Promise<ExportJob> {
    const result = await checkExportStatusAction(jobId);
    
    if (!result.success || !result.job) {
      throw new Error(result.error || 'Failed to check export status');
    }

    return result.job;
  }

  /**
   * Get export download URL
   */
  static async getDownloadUrl(jobId: string): Promise<{ downloadUrl: string; fileName: string }> {
    const result = await getExportDownloadUrlAction(jobId);
    
    if (!result.success || !result.downloadUrl || !result.fileName) {
      throw new Error(result.error || 'Failed to get download URL');
    }

    return { 
      downloadUrl: result.downloadUrl, 
      fileName: result.fileName 
    };
  }
}