export interface Neighborhood {
  id: number;
  name: string;
  commune?: {
    id: number;
    name: string;
    city?: {
      id: number;
      name: string;
    };
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateNeighborhoodData {
  name: string;
  communeId: number;
}

export interface UpdateNeighborhoodData {
  name?: string;
  communeId?: number;
}
