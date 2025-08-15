/**
 * Domain Types and Interfaces
 * Business domain interfaces migrated from legacy services/api.ts
 */

// Location domain types
export interface Commune {
  id: number;
  name: string;
  city?: {
    id: number;
    name: string;
  };
}

export interface Neighborhood {
  id: number;
  name: string;
  commune?: Commune;
}

// Activity and field types
export interface ActivityArea {
  id: number;
  name: string;
}

export interface FieldSurfaceType {
  id: number;
  name: string;
}

// Scenario types
export interface Scenario {
  id: number;
  name: string;
  address: string;
  neighborhood?: Neighborhood;
  description?: string;
  active: boolean;
}

// Sub-scenario image types
export interface SubScenarioImage {
  id: number;
  path: string; // Relative path (/uploads/images/...)
  url?: string; // Full URL (for compatibility)
  isFeature: boolean;
  displayOrder: number;
  subScenarioId: number;
  createdAt?: string | Date;
}

export interface SubScenarioImageGallery {
  featured?: SubScenarioImage;
  additional: SubScenarioImage[];
  count: number;
}

// Sub-scenario interface
export interface SubScenario {
  id: number;
  name: string;
  active: boolean;
  hasCost: boolean;
  numberOfSpectators?: number;
  numberOfPlayers?: number;
  recommendations?: string;
  createdAt?: string; // or Date if you prefer parsing it

  // Relationship IDs
  scenarioId?: number;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;

  // Relationship objects
  scenario?: Scenario;
  activityArea?: ActivityArea;
  fieldSurfaceType?: FieldSurfaceType;

  // Associated images
  imageGallery?: SubScenarioImageGallery;
  images?: SubScenarioImage[];
}