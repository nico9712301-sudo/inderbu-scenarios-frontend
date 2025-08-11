import { GetClientsDataUseCase } from '../application/GetClientsDataUseCase';
import { ClientsService } from '../domain/ClientsService';
import {
  UserRepository,
  RoleRepository,
  NeighborhoodRepository,
} from '../infrastructure/UserRepository';
import {
  IUserRepository,
  IRoleRepository,
  INeighborhoodRepository,
} from '../domain/repositories/IUserRepository';

export interface ClientsContainer {
  clientsService: ClientsService;
}

export function createClientsContainer(): ClientsContainer {
  // DDD: Dependency injection - build complete container with repositories
  
  // Infrastructure layer - Repository implementations
  const userRepository: IUserRepository = new UserRepository();
  const roleRepository: IRoleRepository = new RoleRepository();
  const neighborhoodRepository: INeighborhoodRepository = new NeighborhoodRepository();
  
  // Application layer - Use cases with injected repositories
  const getClientsDataUseCase = new GetClientsDataUseCase(
    userRepository,
    roleRepository,
    neighborhoodRepository
  );
  
  // Domain layer - Services with injected use cases
  const clientsService = new ClientsService(
    getClientsDataUseCase
  );

  return {
    clientsService,
  };
}
