import { GetOptionsDataUseCase } from '../application/GetOptionsDataUseCase';
import { OptionsService } from '../domain/OptionsService';
import { OptionsRepository } from '../infrastructure/OptionsRepository';
import { IOptionsRepository } from '../domain/repositories/IOptionsRepository';

export interface OptionsContainer {
  optionsService: OptionsService;
}

export function createOptionsContainer(): OptionsContainer {
  // DDD: Dependency injection - build complete container with repositories
  
  // Infrastructure layer - Repository implementations
  const optionsRepository: IOptionsRepository = new OptionsRepository();
  
  // Application layer - Use cases with injected repositories
  const getOptionsDataUseCase = new GetOptionsDataUseCase(
    optionsRepository
  );
  
  // Domain layer - Services with injected use cases
  const optionsService = new OptionsService(
    getOptionsDataUseCase
  );

  return {
    optionsService,
  };
}
