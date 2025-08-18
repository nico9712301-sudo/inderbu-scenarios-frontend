import { useMemo } from 'react';
import { IImageGallery } from '@/infrastructure/transformers/SubScenarioTransformer';
import { usePlaceholderImage } from '@/shared/hooks/use-placeholder-image';

interface CarouselSlide {
  id: number;
  imageUrl: string;
  title: string;
}

interface CarouselData {
  slides: CarouselSlide[];
  showNavigationArrows: boolean;
}

/**
 * Hook para manejar la lógica de slides del carousel
 * 
 * Lógica:
 * - Si hay al menos una imagen real (featured o additional): mostrar solo las que existen
 * - Si no hay ninguna imagen real: mostrar 3 placeholders
 * - Las flechas de navegación solo se muestran si hay más de un slide
 */
export function useCarouselSlides(imagesGallery: IImageGallery): CarouselData {
  const placeholderImage = usePlaceholderImage();
  
  const slides = useMemo(() => {
    const slidesScenario: CarouselSlide[] = [];
    
    // Verificar si hay al menos una imagen real (featured o additional)
    const hasFeaturedImage = imagesGallery.featured?.url;
    const hasAdditionalImages = imagesGallery.additional?.length > 0;
    const hasAnyRealImages = hasFeaturedImage || hasAdditionalImages;

    if (hasAnyRealImages) {
      // Caso: Hay imágenes reales - mostrar solo las que existen
      
      // Agregar featured si existe
      if (hasFeaturedImage) {
        slidesScenario.push({
          id: imagesGallery.featured!.id,
          imageUrl: imagesGallery.featured!.url,
          title: imagesGallery.featured!.url,
        });
      }

      // Agregar additional si existen
      if (hasAdditionalImages) {
        imagesGallery.additional.forEach((slide) => {
          slidesScenario.push({
            id: slide.id,
            imageUrl: slide.url,
            title: slide.url,
          });
        });
      }
    } else {
      // Caso: No hay imágenes reales - mostrar placeholders dinámicos
      
      // Agregar 3 placeholders dinámicos
      for (let i = 1; i <= 3; i++) {
        slidesScenario.push({
          id: i,
          imageUrl: placeholderImage,
          title: `Imagen placeholder ${i}`,
        });
      }
    }

    return slidesScenario;
  }, [imagesGallery, placeholderImage]);

  const carouselData = useMemo(() => ({
    slides,
    showNavigationArrows: slides.length > 1
  }), [slides]);

  return carouselData;
}