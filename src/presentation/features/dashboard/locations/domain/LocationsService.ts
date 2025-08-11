import { 
  GetLocationsDataUseCase, 
  LocationsDataResponse 
} from '../application/GetLocationsDataUseCase';
import { CommuneFilters, NeighborhoodFilters } from './repositories/ILocationRepository';

export class LocationsService {
  constructor(
    private readonly getLocationsDataUseCase: GetLocationsDataUseCase
  ) {}

  async getLocationsData(
    communeFilters: CommuneFilters = {},
    neighborhoodFilters: NeighborhoodFilters = {}
  ): Promise<LocationsDataResponse> {
    return await this.getLocationsDataUseCase.execute(communeFilters, neighborhoodFilters);
  }
}
