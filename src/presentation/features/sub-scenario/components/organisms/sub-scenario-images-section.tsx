"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { SingleImageInput, ImageChangeAction, ImageValue } from "../molecules/single-image-input";
import { ImageUploadData, ImageManagementData, ImageSlotManagement } from "@/application/dashboard/sub-scenarios/use-cases/UploadSubScenarioImagesUseCase";
import { SubScenarioImage } from "@/shared/api";

interface SubScenarioImagesSectionProps {
  images: ImageUploadData[];
  onChange: (images: ImageUploadData[]) => void;
  imageGallery?: {
    featured?: SubScenarioImage;
    additional: SubScenarioImage[];
    count: number;
  };
  onImageManagementChange?: (imageManagement: ImageSlotManagement) => void;
}

export function SubScenarioImagesSection({
  images,
  onChange,
  imageGallery,
  onImageManagementChange,
}: SubScenarioImagesSectionProps) {
  // Initialize image management state
  const [imageManagement, setImageManagement] = useState<ImageSlotManagement>({
    featured: null,
    additional1: null,
    additional2: null
  });
  
  // Initialize from existing imageGallery on mount or when imageGallery changes
  useEffect(() => {
    if (imageGallery) {
      // Map images by their actual displayOrder, not by array position
      const imagesByDisplayOrder = new Map<number, SubScenarioImage>();
      imageGallery.additional.forEach(img => {
        imagesByDisplayOrder.set(img.displayOrder, img);
      });
      
      setImageManagement({
        featured: imageGallery.featured ? {
          existingImage: imageGallery.featured,
          action: 'keep',
          isFeature: true,
          displayOrder: 0
        } : null,
        additional1: imagesByDisplayOrder.get(1) ? {
          existingImage: imagesByDisplayOrder.get(1)!,
          action: 'keep',
          isFeature: false,
          displayOrder: 1
        } : null,
        additional2: imagesByDisplayOrder.get(2) ? {
          existingImage: imagesByDisplayOrder.get(2)!,
          action: 'keep',
          isFeature: false,
          displayOrder: 2
        } : null
      });
    }
  }, [imageGallery]);
  
  // Notify parent of changes
  useEffect(() => {
    onImageManagementChange?.(imageManagement);
  }, [imageManagement, onImageManagementChange]);
  
  // Get current display values
  const getImageValue = (slot: ImageManagementData | null): ImageValue => {
    if (!slot) return null;
    if (slot.action === 'delete') return null;
    if (slot.newFile) return slot.newFile;
    if (slot.existingImage) return slot.existingImage;
    return null;
  };

  const featureImageValue = getImageValue(imageManagement.featured);
  const additional1Value = getImageValue(imageManagement.additional1);
  const additional2Value = getImageValue(imageManagement.additional2);

  // Handle image changes
  const handleImageChange = useCallback((slot: 'featured' | 'additional1' | 'additional2') => 
    (action: ImageChangeAction) => {
      setImageManagement(prev => {
        const currentSlot = prev[slot];
        let newSlot: ImageManagementData | null = null;
        
        if (action.type === 'delete') {
          // If there's an existing image, mark it for deletion
          if (currentSlot?.existingImage || action.existingImage) {
            newSlot = {
              existingImage: currentSlot?.existingImage || action.existingImage,
              action: 'delete',
              isFeature: slot === 'featured',
              displayOrder: slot === 'featured' ? 0 : slot === 'additional1' ? 1 : 2
            };
          } else {
            // No existing image, just clear the slot
            newSlot = null;
          }
        } else if (action.type === 'replace' && action.newFile) {
          newSlot = {
            existingImage: currentSlot?.existingImage,
            newFile: action.newFile,
            action: 'replace',
            isFeature: slot === 'featured',
            displayOrder: slot === 'featured' ? 0 : slot === 'additional1' ? 1 : 2
          };
        }
        
        return {
          ...prev,
          [slot]: newSlot
        };
      });
    }, []);
    
  // Use a ref to track the previous images to avoid infinite loops
  const prevImagesRef = useRef<ImageUploadData[]>([]);

  // Update legacy images array when imageManagement changes
  useEffect(() => {
    const newImages: ImageUploadData[] = [];
    
    if (imageManagement.featured?.newFile) {
      newImages.push({ file: imageManagement.featured.newFile, isFeature: true });
    }
    if (imageManagement.additional1?.newFile) {
      newImages.push({ file: imageManagement.additional1.newFile, isFeature: false });
    }
    if (imageManagement.additional2?.newFile) {
      newImages.push({ file: imageManagement.additional2.newFile, isFeature: false });
    }

    // Only call onChange if the images actually changed
    const hasChanged = 
      newImages.length !== prevImagesRef.current.length ||
      newImages.some((img, index) => {
        const prevImg = prevImagesRef.current[index];
        return !prevImg || img.file !== prevImg.file || img.isFeature !== prevImg.isFeature;
      });

    if (hasChanged) {
      // console.log("SubScenarioImagesSection - New images array:", newImages);
      prevImagesRef.current = newImages;
      onChange(newImages);
    }
  }, [imageManagement]);

  // Create specific handlers for each slot
  const handleFeatureChange = handleImageChange('featured');
  const handleAdditional1Change = handleImageChange('additional1');
  const handleAdditional2Change = handleImageChange('additional2');

  return (
    <section className="bg-gray-50 p-4 rounded-md space-y-4">
      <h3 className="font-medium text-sm text-gray-800">
        Imágenes del Sub-Escenario
      </h3>

      {/* Feature Image */}
      <div>
        <SingleImageInput
          label="Imagen Principal (Banner)"
          description="Esta será la imagen destacada que aparecerá en la vista principal"
          value={featureImageValue}
          onChange={handleFeatureChange}
          isFeature={true}
          placeholder="Seleccionar imagen principal"
          existingImage={imageManagement.featured?.existingImage}
        />
      </div>

      {/* Additional Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SingleImageInput
          label="Imagen Adicional 1"
          description="Primera imagen adicional para la galería"
          value={additional1Value}
          onChange={handleAdditional1Change}
          placeholder="Seleccionar primera imagen"
          existingImage={imageManagement.additional1?.existingImage}
        />

        <SingleImageInput
          label="Imagen Adicional 2"
          description="Segunda imagen adicional para la galería"
          value={additional2Value}
          onChange={handleAdditional2Change}
          placeholder="Seleccionar segunda imagen"
          existingImage={imageManagement.additional2?.existingImage}
        />
      </div>

      {/* Info message */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> La imagen principal aparecerá como banner en la
          vista de detalle. Las imágenes adicionales se mostrarán en la galería
          del sub-escenario.
        </p>
      </div>
    </section>
  );
}
