"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import { slidesScenario } from "@/shared/mock-data/slides-scenario";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import * as React from "react";


export function SimpleCarousel() {
  return (
    <div className="w-full relative">
      <Carousel className="w-full" plugins={[Autoplay({ delay: 10000 })]}>
        <CarouselContent>
          {slidesScenario.map((slide) => (
            <CarouselItem key={slide.id} className="p-0">
              <div className="relative w-full h-96">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  priority
                  style={{ objectFit: "cover" }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* ← Aquí las flechas absolutas sobre el slide → */}
        <CarouselPrevious className="absolute top-1/2 left-4 -translate-y-1/2 z-20 cursor-pointer bg-gray-200" />
        <CarouselNext className="absolute top-1/2 right-4 -translate-y-1/2 z-20 cursor-pointer bg-gray-200" />
      </Carousel>
    </div>
  );
}
