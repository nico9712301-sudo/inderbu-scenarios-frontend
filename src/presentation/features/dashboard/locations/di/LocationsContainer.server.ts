import { GetLocationsDataUseCase } from '../application/GetLocationsDataUseCase';
import { LocationsService } from '../domain/LocationsService';
import {
  CommuneRepository,
  NeighborhoodRepository,
  CityRepository,
} from '../infrastructure/LocationRepository';
import {
  ICommuneRepository,
  INeighborhoodRepository,
  ICityRepository,
} from '../domain/repositories/ILocationRepository';

export interface LocationsContainer {
  locationsService: LocationsService;
}

export function createLocationsContainer(): LocationsContainer {
  // DDD: Dependency injection - build complete container with repositories
  
  // Infrastructure layer - Repository implementations
  const communeRepository: ICommuneRepository = new CommuneRepository();
  const neighborhoodRepository: INeighborhoodRepository = new NeighborhoodRepository();
  const cityRepository: ICityRepository = new CityRepository();
  
  // Application layer - Use cases with injected repositories
  const getLocationsDataUseCase = new GetLocationsDataUseCase(
    communeRepository,
    neighborhoodRepository,
    cityRepository
  );
  
  // Domain layer - Services with injected use cases
  const locationsService = new LocationsService(
    getLocationsDataUseCase
  );

  return {
    locationsService,
  };
}
