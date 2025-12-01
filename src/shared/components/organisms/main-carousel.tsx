"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import { normalizeImageUrl } from "@/shared/utils/image-url.utils";
import { HomeSlide } from "@/shared/api/home-slides";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import * as React from "react";


interface MainCarouselProps {
  slides: HomeSlide[];
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
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="p-0">
              <div className="relative w-full h-96">
                <Image
                  src={normalizeImageUrl(slide.imageUrl)}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  priority
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                  }}
                  className="brightness-100"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute inset-0 flex justify-between items-center px-4 z-20">
          <CarouselPrevious className="!left-0 !translate-x-0" />
          <CarouselNext className="!right-0 !translate-x-0" />
        </div>
      </Carousel>
    </div>
  );
}
