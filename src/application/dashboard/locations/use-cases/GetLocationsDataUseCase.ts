import { CommuneFilters } from '@/entities/commune/infrastructure/commune-repository.port';
import { NeighborhoodFilters } from '@/entities/neighborhood/infrastructure/INeighborhoodRepository';
import { PageMetaDto } from '@/shared/api';
import { GetCommunesUseCase } from './GetCommunesUseCase';
import { GetNeighborhoodsUseCase } from './GetNeighborhoodsUseCase';
import { GetCitiesUseCase } from './GetCitiesUseCase';
import { CommuneEntity } from '@/entities/commune/domain/CommuneEntity';
import { NeighborhoodEntity } from '@/entities/neighborhood/domain/NeighborhoodEntity';
import { CityEntity } from '@/entities/city/domain/CityEntity';

export interface ILocationsDataResponse {
  communes: CommuneEntity[];
  neighborhoods: NeighborhoodEntity[];
  cities: CityEntity[];
  communePageMeta: PageMetaDto | null;
  neighborhoodPageMeta: PageMetaDto | null;
  communeFilters: CommuneFilters;
  neighborhoodFilters: NeighborhoodFilters;
}

export class GetLocationsDataUseCase {
  constructor(
    private readonly getCommunesUseCase: GetCommunesUseCase,
    private readonly getNeighborhoodsUseCase: GetNeighborhoodsUseCase,
    private readonly getCitiesUseCase: GetCitiesUseCase
  ) {}

  async execute(
    communeFilters: CommuneFilters = {},
    neighborhoodFilters: NeighborhoodFilters = {}
  ): Promise<ILocationsDataResponse> {
    try {
      // Default filters with business rules
      const defaultCommuneFilters: CommuneFilters = {
        page: 1,
        limit: 10, // Business rule: consistent page size for locations
        search: "",
        ...communeFilters,
      };

      const defaultNeighborhoodFilters: NeighborhoodFilters = {
        page: 1,
        limit: 10, // Business rule: consistent page size for locations
        search: "",
        ...neighborhoodFilters,
      };

      // Sanitize search inputs
      if (defaultCommuneFilters.search) {
        defaultCommuneFilters.search = defaultCommuneFilters.search.trim().substring(0, 100);
      }
      if (defaultNeighborhoodFilters.search) {
        defaultNeighborhoodFilters.search = defaultNeighborhoodFilters.search.trim().substring(0, 100);
      }

      // Compose using dedicated use cases
      const [
        communesResult,
        neighborhoodsResult,
        cities,
      ] = await Promise.all([
        this.getCommunesUseCase.execute(defaultCommuneFilters),
        this.getNeighborhoodsUseCase.execute(defaultNeighborhoodFilters),
        this.getCitiesUseCase.execute(),
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