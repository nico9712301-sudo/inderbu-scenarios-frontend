import { GetScenariosDataService, IScenariosDataResponse } from '@/application/dashboard/scenarios/services/GetScenariosDataService';
import { ScenariosPage } from '@/presentation/features/dashboard/scenarios/pages/scenarios.page';
import { ScenarioFilters } from '@/entities/scenario/infrastructure/IScenarioRepository';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { TOKENS } from '@/infrastructure/config/di/tokens';
import { serializeScenariosData } from '@/presentation/utils/serialization.utils';

interface ScenariosRouteProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    neighborhoodId?: string;
    active?: string;
  }>;
}

/**
 * Scenarios Page Route (Server Component)
 * 
 * Next.js App Router page that handles scenarios listing.
 * Uses dependency injection to get data and render the presentation layer.
 */
export default async function ScenariosRoute(props: ScenariosRouteProps) {
  const searchParams = await props.searchParams;

  try {
    // Dependency Injection: Get container and resolve use case
    const container: IContainer = ContainerFactory.createContainer();
    const getScenariosDataService = container.get<GetScenariosDataService>(TOKENS.GetScenariosDataService);
    
    // Parse and validate search params
    const filters: ScenarioFilters = {
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: searchParams.limit ? parseInt(searchParams.limit) : 7,
      search: searchParams.search || "",
      neighborhoodId: searchParams.neighborhoodId
        ? parseInt(searchParams.neighborhoodId)
        : undefined,
      active: searchParams.active !== undefined
        ? searchParams.active === 'true'
        : undefined,
    };

    // Execute Use Case through Application Layer - returns pure Domain Entities
    const domainResult: IScenariosDataResponse = await getScenariosDataService.execute(filters);

    console.log('ScenariosRoute - Domain Result:', domainResult);
    
    
    // Presentation Layer responsibility: Serialize domain entities for client components
    const serializedResult = serializeScenariosData(domainResult);

    // Render Presentation Layer with serialized data (plain objects)
    return (
      <ScenariosPage
        initialData={serializedResult}
      />
    );

  } catch (error) {
    console.error('Error in ScenariosRoute:', error);
    
    // TODO: Render proper error page/component
    throw error;
  }
}
