/**
 * File upload configuration constants
 */
export const FILE_UPLOAD = {
  // Image file size limits (in bytes)
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB (matches backend multer config)
  
  // Supported image formats
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ] as const,
  
  // User-friendly limits
  MAX_IMAGE_SIZE_MB: 5,
} as const;

/**
 * Utility functions for file validation
 */
export const FileValidation = {
  /**
   * Format file size to human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  },

  /**
   * Check if file size is valid
   */
  isValidFileSize(file: File): boolean {
    return file.size <= FILE_UPLOAD.MAX_IMAGE_SIZE;
  },

  /**
   * Check if file type is valid
   */
  isValidImageType(file: File): boolean {
    return FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type as any);
  },

  /**
   * Get file size error message
   */
  getFileSizeError(file: File): string {
    const currentSize = this.formatFileSize(file.size);
    const maxSize = this.formatFileSize(FILE_UPLOAD.MAX_IMAGE_SIZE);
    return `El archivo "${file.name}" (${currentSize}) excede el tamaño máximo permitido de ${maxSize}.`;
  },

  /**
   * Get file type error message
   */
  getFileTypeError(file: File): string {
    return `El archivo "${file.name}" no es un tipo de imagen válido. Formatos permitidos: JPEG, PNG, GIF, WebP.`;
  }
};