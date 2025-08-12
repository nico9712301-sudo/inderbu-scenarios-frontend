"use client";

import { useCallback } from "react";
import { SingleImageInput } from "../molecules/single-image-input";
import { ImageUploadData } from "@/application/dashboard/sub-scenarios/use-cases/UploadSubScenarioImagesUseCase";

interface SubScenarioImagesSectionProps {
  images: ImageUploadData[];
  onChange: (images: ImageUploadData[]) => void;
}

export function SubScenarioImagesSection({ images, onChange }: SubScenarioImagesSectionProps) {
  // Get current images by type
  const featureImage = images.find(img => img.isFeature)?.file || null;
  const additionalImages = images.filter(img => !img.isFeature).map(img => img.file);
  const image1 = additionalImages[0] || null;
  const image2 = additionalImages[1] || null;

  // Helper to update images array
  const updateImages = useCallback((newFeature: File | null, newImage1: File | null, newImage2: File | null) => {
    const newImages: ImageUploadData[] = [];
    
    // Add feature image if present
    if (newFeature) {
      newImages.push({ file: newFeature, isFeature: true });
    }
    
    // Add additional images if present
    if (newImage1) {
      newImages.push({ file: newImage1, isFeature: false });
    }
    if (newImage2) {
      newImages.push({ file: newImage2, isFeature: false });
    }
    
    onChange(newImages);
  }, [onChange]);

  // Individual handlers for each image to prevent recreation
  const handleFeatureImageChange = useCallback((file: File | null) => {
    // Get current state at time of call instead of using stale closure values
    const currentImages = images;
    const currentAdditionalImages = currentImages.filter(img => !img.isFeature).map(img => img.file);
    updateImages(file, currentAdditionalImages[0] || null, currentAdditionalImages[1] || null);
  }, [updateImages, images]);

  const handleImage1Change = useCallback((file: File | null) => {
    // Get current state at time of call instead of using stale closure values
    const currentImages = images;
    const currentFeatureImage = currentImages.find(img => img.isFeature)?.file || null;
    const currentAdditionalImages = currentImages.filter(img => !img.isFeature).map(img => img.file);
    updateImages(currentFeatureImage, file, currentAdditionalImages[1] || null);
  }, [updateImages, images]);

  const handleImage2Change = useCallback((file: File | null) => {
    // Get current state at time of call instead of using stale closure values
    const currentImages = images;
    const currentFeatureImage = currentImages.find(img => img.isFeature)?.file || null;
    const currentAdditionalImages = currentImages.filter(img => !img.isFeature).map(img => img.file);
    updateImages(currentFeatureImage, currentAdditionalImages[0] || null, file);
  }, [updateImages, images]);

  return (
    <section className="bg-gray-50 p-4 rounded-md space-y-4">
      <h3 className="font-medium text-sm text-gray-800">Imágenes del Sub-Escenario</h3>
      
      {/* Feature Image */}
      <div>
        <SingleImageInput
          label="Imagen Principal (Banner)"
          description="Esta será la imagen destacada que aparecerá en la vista principal"
          value={featureImage}
          onChange={handleFeatureImageChange}
          isFeature={true}
          placeholder="Seleccionar imagen principal"
        />
      </div>

      {/* Additional Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SingleImageInput
          label="Imagen Adicional 1"
          description="Primera imagen adicional para la galería"
          value={image1}
          onChange={handleImage1Change}
          placeholder="Seleccionar primera imagen"
        />
        
        <SingleImageInput
          label="Imagen Adicional 2"
          description="Segunda imagen adicional para la galería"
          value={image2}
          onChange={handleImage2Change}
          placeholder="Seleccionar segunda imagen"
        />
      </div>

      {/* Info message */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> La imagen principal aparecerá como banner en la vista de detalle. 
          Las imágenes adicionales se mostrarán en la galería del sub-escenario.
        </p>
      </div>

    </section>
  );
}