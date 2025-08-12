"use client";

import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useRef, useMemo, useEffect } from "react";
import { Label } from "@/shared/ui/label";
import { FILE_UPLOAD, FileValidation } from "@/shared/constants/file-upload.constants";
import { toast } from "sonner";

// Global cache for blob URLs to prevent recreation across renders
const blobUrlCache = new Map<string, string>();

interface SingleImageInputProps {
  label: string;
  description?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  isFeature?: boolean;
  placeholder?: string;
}

export function SingleImageInput({
  label,
  description,
  value,
  onChange,
  isFeature = false,
  placeholder = "Haz clic para seleccionar imagen"
}: SingleImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Use only the value from props - remove local state confusion
  const currentFile = value;
  
  // Use global cache to prevent blob URL recreation across renders
  const fileIdentity = currentFile ? `${currentFile.name}-${currentFile.size}-${currentFile.lastModified}` : null;
  
  const blobUrl = useMemo(() => {
    if (!currentFile || !fileIdentity) return null;
    
    // Check if we already have a blob URL for this file
    if (blobUrlCache.has(fileIdentity)) {
      return blobUrlCache.get(fileIdentity)!;
    }
    
    // Create new blob URL and cache it
    const url = URL.createObjectURL(currentFile);
    blobUrlCache.set(fileIdentity, url);
    return url;
  }, [fileIdentity, currentFile, label]);
  
  // Cleanup blob URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (fileIdentity && blobUrlCache.has(fileIdentity)) {
        const cachedUrl = blobUrlCache.get(fileIdentity)!;
        URL.revokeObjectURL(cachedUrl);
        blobUrlCache.delete(fileIdentity);
      }
    };
  }, [fileIdentity, label]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!FileValidation.isValidImageType(file)) {
      toast.error("Tipo de archivo no válido", {
        description: FileValidation.getFileTypeError(file)
      });
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Validate file size
    if (!FileValidation.isValidFileSize(file)) {
      toast.error("Archivo demasiado grande", {
        description: FileValidation.getFileSizeError(file)
      });
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // File is valid, proceed
    onChange(file);
  };
  
  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-gray-700">
          {label}
          {isFeature && (
            <span className="ml-1 px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full">
              Principal
            </span>
          )}
        </Label>
      </div>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      {/* File requirements info */}
      <p className="text-xs text-gray-400">
        Máximo {FileValidation.formatFileSize(FILE_UPLOAD.MAX_IMAGE_SIZE)} • 
        Formatos: JPEG, PNG, GIF, WebP
      </p>

      <div className="relative">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_UPLOAD.ALLOWED_IMAGE_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Image preview or upload area */}
        {currentFile ? (
          <div className="relative group">
            <div className="w-full h-32 rounded-lg border-2 border-gray-200 bg-gray-50 overflow-hidden">
              <img
                src={blobUrl || ''}
                alt="Preview"
                className="w-full h-full object-cover"
                style={{ maxWidth: '100%', maxHeight: '128px' }}
              />
            </div>
            
            {/* Remove button positioned outside overlay */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="absolute top-2 right-2 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center space-y-2"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-colors">
              {isFeature ? (
                <ImageIcon className="h-6 w-6 text-gray-500" />
              ) : (
                <Upload className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">{placeholder}</p>
              <p className="text-xs text-gray-500">JPG, PNG hasta 5MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}