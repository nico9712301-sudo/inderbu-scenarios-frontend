import { SubScenarioImage } from '@/services/api';
import { FILE_UPLOAD, FileValidation } from '@/shared/constants/file-upload.constants';

export interface ImageUploadData {
  file: File;
  isFeature: boolean;
}

export class UploadSubScenarioImagesUseCase {
  constructor(
    // En este caso, manejamos la subida directamente con HTTP client
    // ya que es un caso especial de manejo de archivos
  ) { }

  async execute(subScenarioId: number, images: ImageUploadData[]): Promise<SubScenarioImage[]> {
    // Validar archivos antes de procesar
    for (const imageData of images) {
      if (!FileValidation.isValidImageType(imageData.file)) {
        throw new Error(FileValidation.getFileTypeError(imageData.file));
      }
      if (!FileValidation.isValidFileSize(imageData.file)) {
        throw new Error(FileValidation.getFileSizeError(imageData.file));
      }
    }

    // Convertir a FormData para subida de archivos
    const formData = new FormData();

    // El backend espera file1, file2, file3 con sus respectivos flags isFeature1, isFeature2, isFeature3
    images.forEach((imageData, index) => {
      const fileFieldName = `file${index + 1}`;
      const isFeatureFieldName = `isFeature${index + 1}`;

      formData.append(fileFieldName, imageData.file);
      formData.append(isFeatureFieldName, imageData.isFeature ? 'true' : 'false');
    });

    // En lugar de usar repository, usamos HTTP client directamente
    // porque FormData requiere manejo especial
    const { ClientHttpClientFactory } = await import('@/shared/api/http-client-client');
    const { createServerAuthContext } = await import('@/shared/api/server-auth');

    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    try {
      // Let's add multipart/form-data header automatically
      const response = await httpClient.post<{ data: SubScenarioImage[] }>(
        `/sub-scenarios/${subScenarioId}/images`,
        formData
      );

      return response.data || [];
    } catch (error) {
      console.error('Error uploading sub-scenario images:', error);
      throw error;
    }
  }
}