import { IImageGallery } from "@/infrastructure/transformers/SubScenarioTransformer";

export const slidesPlaceerholderScenario: IImageGallery = {
  featured: {
    createdAt: "2023-10-01T12:00:00Z",
    displayOrder: 1,
    id: 1,
    isFeature: true,
    url: "https://inderbu.gov.co/escenarios/content/fields/35/83711.jpeg",
    current: true,
  },
  count: 2,
  additional: [
    {
      createdAt: "2023-10-01T12:00:00Z",
      displayOrder: 1,
      id: 2,
      isFeature: true,
      url: "https://inderbu.gov.co/escenarios/content/fields/33/31096.jpg",
      current: true,
    },
    {
      createdAt: "2023-10-01T12:00:00Z",
      displayOrder: 1,
      id: 3,
      isFeature: true,
      url: "https://inderbu.gov.co/escenarios/content/fields/34/44329.jpg",
      current: true,
    },
  ],
};
