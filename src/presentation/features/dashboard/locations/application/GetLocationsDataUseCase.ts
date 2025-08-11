import { Commune, Neighborhood, PageMeta } from '@/services/api';
import {
  ICommuneRepository,
  INeighborhoodRepository,
  ICityRepository,
  CommuneFilters,
  NeighborhoodFilters,
  City,
} from '../domain/repositories/ILocationRepository';

export interface LocationsDataResponse {
  communes: Commune[];
  neighborhoods: Neighborhood[];
  cities: City[];
  communePageMeta: PageMeta | null;
  neighborhoodPageMeta: PageMeta | null;
  communeFilters: CommuneFilters;
  neighborhoodFilters: NeighborhoodFilters;
}

export class GetLocationsDataUseCase {
  constructor(
    private readonly communeRepository: ICommuneRepository,
    private readonly neighborhoodRepository: INeighborhoodRepository,
    private readonly cityRepository: ICityRepository
  ) {}

  async execute(
    communeFilters: CommuneFilters = {},
    neighborhoodFilters: NeighborhoodFilters = {}
  ): Promise<LocationsDataResponse> {
    try {
      // Default filters
      const defaultCommuneFilters: CommuneFilters = {
        page: 1,
        limit: 10,
        search: "",
        ...communeFilters,
      };

      const defaultNeighborhoodFilters: NeighborhoodFilters = {
        page: 1,
        limit: 10,
        search: "",
        ...neighborhoodFilters,
      };

      // Load all data in parallel using repositories
      const [
        communesResult,
        neighborhoodsResult,
        cities,
        allCommunes, // For select options
      ] = await Promise.all([
        this.communeRepository.getAllWithPagination(defaultCommuneFilters),
        this.neighborhoodRepository.getAllWithPagination(defaultNeighborhoodFilters),
        this.cityRepository.getAll(),
        this.communeRepository.getAll(), // For neighborhood creation/editing
      ]);

      return {
        communes: communesResult.data,
        neighborhoods: neighborhoodsResult.data,
        cities,
        communePageMeta: communesResult.meta,
        neighborhoodPageMeta: neighborhoodsResult.meta,
        communeFilters: defaultCommuneFilters,
        neighborhoodFilters: defaultNeighborhoodFilters,
      };

    } catch (error) {
      console.error('Error in GetLocationsDataUseCase:', error);
      throw error;
    }
  }
}
