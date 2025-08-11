import { ExportJob } from '@/shared/hooks/use-async-export';

export interface ExportScenariosOptions {
  format?: 'xlsx' | 'csv';
  filters?: {
    active?: boolean;
    neighborhoodId?: number;
    search?: string;
  };
  includeFields?: string[];
}

export interface ExportScenariosPayload {
  format: 'xlsx' | 'csv';
  filters: Record<string, any>;
  includeFields: string[];
}

export interface ExportRepository {
  startExport(payload: ExportScenariosPayload): Promise<{ success: boolean; jobId?: string; error?: string }>;
  checkExportStatus(jobId: string): Promise<{ success: boolean; job?: ExportJob; error?: string }>;
  getDownloadUrl(jobId: string): Promise<{ success: boolean; downloadUrl?: string; fileName?: string; error?: string }>;
}

export class ScenarioExportService {
  
  constructor(private readonly exportRepository: ExportRepository) {}

  /**
   * Start async export job with business validation
   */
  async startExport(options: ExportScenariosOptions = {}): Promise<{ jobId: string }> {
    // Business validation
    this.validateExportOptions(options);

    const payload: ExportScenariosPayload = {
      format: options.format || 'xlsx',
      filters: options.filters || {},
      includeFields: options.includeFields || [
        'id', 'name', 'address', 'active', 'neighborhood.name', 'createdAt'
      ],
    };

    const result = await this.exportRepository.startExport(payload);
    
    if (!result.success || !result.jobId) {
      throw new Error(result.error || 'Failed to start export');
    }

    return { jobId: result.jobId };
  }

  /**
   * Check export job status
   */
  async checkExportStatus(jobId: string): Promise<ExportJob> {
    if (!jobId || jobId.trim().length === 0) {
      throw new Error('Job ID is required');
    }

    const result = await this.exportRepository.checkExportStatus(jobId);
    
    if (!result.success || !result.job) {
      throw new Error(result.error || 'Failed to check export status');
    }

    return result.job;
  }

  /**
   * Get export download URL with validation
   */
  async getDownloadUrl(jobId: string): Promise<{ downloadUrl: string; fileName: string }> {
    if (!jobId || jobId.trim().length === 0) {
      throw new Error('Job ID is required');
    }

    const result = await this.exportRepository.getDownloadUrl(jobId);
    
    if (!result.success || !result.downloadUrl || !result.fileName) {
      throw new Error(result.error || 'Failed to get download URL');
    }

    return { 
      downloadUrl: result.downloadUrl, 
      fileName: result.fileName 
    };
  }

  /**
   * Business validation for export options
   */
  private validateExportOptions(options: ExportScenariosOptions): void {
    if (options.format && !['xlsx', 'csv'].includes(options.format)) {
      throw new Error('Export format must be either xlsx or csv');
    }

    if (options.includeFields && options.includeFields.length === 0) {
      throw new Error('At least one field must be included in export');
    }

    if (options.filters?.search && options.filters.search.length > 255) {
      throw new Error('Search term cannot exceed 255 characters');
    }

    if (options.filters?.neighborhoodId && options.filters.neighborhoodId <= 0) {
      throw new Error('Invalid neighborhood ID');
    }
  }
}
