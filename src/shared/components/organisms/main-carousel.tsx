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
                  src={slide.imageUrl.includes("http") ? slide.imageUrl : `http://localhost:3001${slide.imageUrl}`}
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
                {/* <div className="absolute inset-0 flex flex-col justify-center items-start z-10">
                  <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-white mb-2">
                      {slide.title}
                    </h2>
                    {slide.description && (
                      <p className="text-xl text-white mb-6 max-w-lg">
                        {slide.description}
                      </p>
                    )}
                    {slide.imageUrl && (
                      <Link
                        href={slide.imageUrl.includes("http") ? slide.imageUrl : `http://localhost:3001${slide.imageUrl}`}
                        className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-6 rounded-md transition duration-300 inline-block"
                      >
                        Ver más
                      </Link>
                    )}
                  </div>
                </div> */}
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
