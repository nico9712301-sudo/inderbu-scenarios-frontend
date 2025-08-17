"use client";

import { IImageGallery } from "@/infrastructure/transformers/SubScenarioTransformer";
import { SimpleCarousel } from "@/shared/components/organisms/simple-carousel";

interface Props {
  imagesGallery: IImageGallery;
}

export const ScenarioImageCarousel = ({ imagesGallery }: Props) => (
  <div className="relative bg-teal-500 rounded-lg overflow-hidden h-[300px]">
    <SimpleCarousel imagesGallery={imagesGallery} />
  </div>
);
