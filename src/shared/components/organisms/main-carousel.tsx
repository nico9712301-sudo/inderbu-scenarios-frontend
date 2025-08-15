"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { slides } from "@/shared/mock-data/slides";
import Image from "next/image";
import * as React from "react";



export function MainCarousel() {
  return (
    <div className="w-full relative">
      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="p-0">
              <div className="relative w-full h-96">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  priority
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                  }}
                  className="brightness-50"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-start z-10">
                  <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-white mb-2">
                      {slide.title}
                    </h2>
                    <p className="text-xl text-white mb-6 max-w-lg">
                      {slide.description}
                    </p>
                    <button className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-6 rounded-md transition duration-300">
                      {slide.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="container mx-auto px-4 relative">
          <CarouselPrevious className="!left-4 !-translate-x-0 z-20" />
          <CarouselNext className="!right-4 !-translate-x-0 z-20" />
        </div>
      </Carousel>
    </div>
  );
}
