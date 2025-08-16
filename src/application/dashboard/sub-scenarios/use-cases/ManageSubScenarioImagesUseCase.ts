import { SubScenarioImage } from '@/shared/api/domain-types';
import { FILE_UPLOAD, FileValidation } from '@/shared/constants/file-upload.constants';
import { ImageSlotManagement, ImageManagementData } from './UploadSubScenarioImagesUseCase';

export interface ImageManagementResult {
  success: boolean;
  images?: SubScenarioImage[];
  error?: string;
}

export class ManageSubScenarioImagesUseCase {
  constructor() {}

  async execute(subScenarioId: number, imageManagement: ImageSlotManagement): Promise<ImageManagementResult> {
    try {
      // console.log(`Managing images for sub-scenario ID ${subScenarioId}`, imageManagement);
      
      // For editing: handle uploads and deletions separately
      const results: SubScenarioImage[] = [];
      
      // Process uploads first
      const filesToUpload: Array<{ file: File; isFeature: boolean; displayOrder: number }> = [];
      
      // Collect files that need to be uploaded (new or replacement)
      if (imageManagement.featured?.newFile) {
        if (!FileValidation.isValidImageType(imageManagement.featured.newFile)) {
          return { success: false, error: FileValidation.getFileTypeError(imageManagement.featured.newFile) };
        }
        if (!FileValidation.isValidFileSize(imageManagement.featured.newFile)) {
          return { success: false, error: FileValidation.getFileSizeError(imageManagement.featured.newFile) };
        }
        filesToUpload.push({ file: imageManagement.featured.newFile, isFeature: true, displayOrder: 0 });
      }
      
      if (imageManagement.additional1?.newFile) {
        if (!FileValidation.isValidImageType(imageManagement.additional1.newFile)) {
          return { success: false, error: FileValidation.getFileTypeError(imageManagement.additional1.newFile) };
        }
        if (!FileValidation.isValidFileSize(imageManagement.additional1.newFile)) {
          return { success: false, error: FileValidation.getFileSizeError(imageManagement.additional1.newFile) };
        }
        filesToUpload.push({ file: imageManagement.additional1.newFile, isFeature: false, displayOrder: 1 });
      }
      
      if (imageManagement.additional2?.newFile) {
        if (!FileValidation.isValidImageType(imageManagement.additional2.newFile)) {
          return { success: false, error: FileValidation.getFileTypeError(imageManagement.additional2.newFile) };
        }
        if (!FileValidation.isValidFileSize(imageManagement.additional2.newFile)) {
          return { success: false, error: FileValidation.getFileSizeError(imageManagement.additional2.newFile) };
        }
        filesToUpload.push({ file: imageManagement.additional2.newFile, isFeature: false, displayOrder: 2 });
      }
      
      // Upload new files
      if (filesToUpload.length > 0) {
        const formData = new FormData();
        
        filesToUpload.forEach((fileData, index) => {
          const fileFieldName = `file${index + 1}`;
          const isFeatureFieldName = `isFeature${index + 1}`;
          const displayOrderFieldName = `displayOrder${index + 1}`;
          
          formData.append(fileFieldName, fileData.file);
          formData.append(isFeatureFieldName, fileData.isFeature ? 'true' : 'false');
          formData.append(displayOrderFieldName, fileData.displayOrder.toString());
        });
        
        const { ClientHttpClientFactory } = await import('@/shared/api/http-client-client');
        const httpClient = ClientHttpClientFactory.createClientWithCookies();
        
        const response = await httpClient.post<{ data: SubScenarioImage[] }>(
          `/sub-scenarios/${subScenarioId}/images`,
          formData
        );
        
        results.push(...(response.data || []));
      }
      
      return { success: true, images: results };
      
    } catch (error) {
      console.error('Error managing sub-scenario images:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al gestionar imágenes'
      };
    }
  }
  
  /**
   * Process image deletions - remove images that were marked for deletion
   */
  async processImageDeletions(subScenarioId: number, imageManagement: ImageSlotManagement): Promise<void> {
    const imagesToDelete: number[] = [];
    
    // Check each slot: if it has an existingImage but is null (was deleted by user), mark for deletion
    const slots = [
      { slot: imageManagement.featured, name: 'featured' },
      { slot: imageManagement.additional1, name: 'additional1' },
      { slot: imageManagement.additional2, name: 'additional2' }
    ];
    
    for (const { slot, name } of slots) {
      // If slot is null but we had an existing image, it means user deleted it
      if (slot === null) {
        // We need to check if there was an existing image in this position
        // This will be handled by the edit dialog passing the correct state
        continue;
      }
      
      // If slot has action 'delete' or if slot exists but has no newFile and no existingImage action is 'keep'
      if (slot?.action === 'delete' && slot.existingImage) {
        imagesToDelete.push(slot.existingImage.id);
      }
    }
    
    if (imagesToDelete.length === 0) return;
    
    console.log(`Deleting ${imagesToDelete.length} images for sub-scenario ${subScenarioId}`, imagesToDelete);
    
    // Delete images via client HTTP client
    const { ClientHttpClientFactory } = await import('@/shared/api/http-client-client');
    
    // Create client that uses cookies for authentication
    const httpClient = ClientHttpClientFactory.createClientWithCookies();
    
    // Delete each image
    for (const imageId of imagesToDelete) {
      try {
        await httpClient.delete(`/sub-scenarios/${subScenarioId}/images/${imageId}`);
      } catch (error) {
        console.error(`Failed to delete image ${imageId}:`, error);
        // Continue with other deletions even if one fails
      }
    }
  }
  
  /**
   * Full image management - handles both deletions and uploads for editing
   */
  async manageAllImages(subScenarioId: number, imageManagement: ImageSlotManagement): Promise<ImageManagementResult> {
    try {
      // First, process deletions
      await this.processImageDeletions(subScenarioId, imageManagement);
      
      // Then, process uploads
      return await this.execute(subScenarioId, imageManagement);
      
    } catch (error) {
      console.error('Error in complete image management:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error completo al gestionar imágenes'
      };
    }
  }
}