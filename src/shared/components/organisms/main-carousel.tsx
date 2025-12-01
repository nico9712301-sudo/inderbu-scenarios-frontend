"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { HomeSlide } from "@/shared/api/home-slides";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

interface MainCarouselProps {
  slides: HomeSlide[];
}

// Helper function to normalize image URLs
function normalizeImageUrl(url: string): string {
  if (!url) return '';
  
  // If URL already includes protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Get API base URL - always use the API URL, not the frontend origin
  // This ensures images are loaded from the correct backend server
  const getApiBaseUrl = (): string => {
    // Check for environment variable first (for production)
    if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL) {
      return (window as any).__NEXT_DATA__.env.NEXT_PUBLIC_API_URL;
    }
    // Fallback to process.env (works in both client and server)
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // Default to localhost:3001 for development (backend API port)
    return 'http://localhost:3001';
  };
  
  const baseUrl = getApiBaseUrl();
  
  // If URL starts with /, it's a relative path - construct full URL
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }
  
  // Otherwise, assume it's a relative path and prepend base URL
  return `${baseUrl}/${url}`;
}

export function MainCarousel({ slides }: MainCarouselProps) {
  return (
    <div className="w-full relative">
      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
      >
        <CarouselContent>
          {slides.map((slide, index) => {
            const normalizedUrl = normalizeImageUrl(slide.imageUrl);
            const isFirstSlide = index === 0;
            
            return (
              <CarouselItem key={slide.id} className="p-0">
                <div className="relative w-full h-96 md:h-[500px]">
                  <Image
                    src={normalizedUrl}
                    alt={slide.title || 'Banner image'}
                    fill
                    sizes="100vw"
                    priority={isFirstSlide}
                    loading={isFirstSlide ? "eager" : "lazy"}
                    quality={90}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                    className="brightness-100"
                    onError={(e) => {
                      console.error('MainCarousel Image Error:', {
                        originalUrl: slide.imageUrl,
                        normalizedUrl,
                        slideId: slide.id,
                        slideTitle: slide.title,
                        error: e
                      });
                    }}
                    onLoad={() => {
                      console.log('MainCarousel Image Loaded:', {
                        slideId: slide.id,
                        url: normalizedUrl
                      });
                    }}
                    />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="absolute inset-0 flex justify-between items-center px-4 z-20">
          <CarouselPrevious className="!left-4 !translate-x-0" />
          <CarouselNext className="!right-4 !translate-x-0" />
        </div>
      </Carousel>
    </div>
  );
}
