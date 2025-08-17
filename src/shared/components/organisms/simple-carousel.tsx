"use client";

import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";

import { IImageGallery } from "@/infrastructure/transformers/SubScenarioTransformer";
import { useCarouselSlides } from "@/shared/hooks/use-carousel-slides";

import Autoplay from "embla-carousel-autoplay";

interface Props {
  imagesGallery: IImageGallery;
}

export function SimpleCarousel({ imagesGallery }: Props) {
  const { slides, showNavigationArrows } = useCarouselSlides(imagesGallery);

  return (
    <div className="w-full relative">
      <Carousel className="w-full" plugins={[Autoplay({ delay: 10000 })]}>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="p-0">
              <div className="relative w-full h-96">
                <Image
                  src={slide.imageUrl!}
                  alt={slide.title!}
                  fill
                  sizes="100vw"
                  priority
                  style={{ objectFit: "cover" }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Solo mostrar flechas si hay más de un slide */}
        {showNavigationArrows && (
          <>
            <CarouselPrevious className="absolute top-1/2 left-4 -translate-y-1/2 z-20 cursor-pointer bg-gray-200" />
            <CarouselNext className="absolute top-1/2 right-4 -translate-y-1/2 z-20 cursor-pointer bg-gray-200" />
          </>
        )}
      </Carousel>
    </div>
  );
}
