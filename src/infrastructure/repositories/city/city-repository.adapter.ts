import {
  CityEntity,
  CityDomainError,
} from "@/entities/city/domain/CityEntity";
import {
  ICityRepository,
  CityFilters,
} from "@/entities/city/infrastructure/city-repository.port";

import {
  BackendResponse,
} from "@/shared/api/backend-types";
import { IHttpClient } from "@/shared/api/types";

import {
  CityTransformer,
  CityBackend,
} from "@/infrastructure/transformers/CityTransformer";
import { executeWithDomainError } from "./execute-with-domain-error.wrapper";

export class CityRepository implements ICityRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async getAll(filters?: CityFilters): Promise<CityEntity[]> {
    return executeWithDomainError(async () => {
      try {
        // Try API call first
        const result: BackendResponse<CityBackend[]> =
          await this.httpClient.get<BackendResponse<CityBackend[]>>("/cities");

        // Transform backend data to domain entities
        const transformedData: CityEntity[] = result.data.map(
          (cityData) =>
            CityTransformer.toDomain(cityData) as CityEntity
        );

        return transformedData;
      } catch (apiError) {
        // Fallback to hardcoded cities if API endpoint doesn't exist yet
        console.log('Cities API not available, using fallback data');
        
        // Return fallback data as domain entities
        const fallbackData = [
          { id: 1, name: "Bucaramanga" }
        ];
        
        return fallbackData.map(cityData => 
          CityTransformer.toDomain(cityData) as CityEntity
        );
      }
    }, 'Failed to fetch cities');
  }

  async getById(id: number): Promise<CityEntity | null> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.get<CityBackend>(
        `/cities/${id}`
      );

      // Transform backend data to domain entity
      return CityTransformer.toDomain(result) as CityEntity;
    }, `Failed to fetch city ${id}`);
  }

  async create(data: Omit<CityEntity, "id">): Promise<CityEntity> {
    return executeWithDomainError(async () => {
      console.log("Creating city with data:", data);
      // Transform domain entity to backend format for API call
      const backendData = CityTransformer.toBackend(data as CityEntity);

      // Call backend API
      const result = await this.httpClient.post<
        BackendResponse<CityBackend>
      >("/cities", backendData);

      // Transform response back to domain entity
      return CityTransformer.toDomain(result.data) as CityEntity;
    }, 'Failed to create city');
  }

  async update(
    id: number,
    data: Partial<CityEntity>
  ): Promise<CityEntity> {
    return executeWithDomainError(async () => {
      const backendData: CityBackend | Partial<CityBackend> =
        CityTransformer.toBackend(data);
      const result: BackendResponse<CityBackend> =
        await this.httpClient.put<BackendResponse<CityBackend>>(
          `/cities/${id}`,
          backendData
        );
      return CityTransformer.toDomain(result.data) as CityEntity;
    }, `Failed to update city ${id}`);
  }

  async delete(id: number): Promise<void> {
    return executeWithDomainError(async () => {
      await this.httpClient.delete(`/cities/${id}`);
    }, `Failed to delete city ${id}`);
  }
}