// Shared types for scenarios feature
export interface IScenarioFormDataDTO {
  name: string;
  address: string;
  description?: string;
  neighborhoodId: number;
  active?: boolean;
}

export interface INeighborhoodOptionDTO {
  id: number;
  name: string;
}