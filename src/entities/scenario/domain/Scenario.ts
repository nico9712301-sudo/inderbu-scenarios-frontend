import { Neighborhood } from '@/shared/api/domain-types';

export interface Scenario {
  id: number;
  name: string;
  address: string;
  description?: string;
  active: boolean;
  neighborhoodId?: number;
  neighborhood?: Neighborhood;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateScenarioData {
  name: string;
  address: string;
  description?: string;
  neighborhoodId: number;
}

export interface UpdateScenarioData {
  name?: string;
  address?: string;
  neighborhoodId?: number;
  active?: boolean;
}