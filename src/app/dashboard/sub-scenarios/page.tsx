import { GetSubScenariosDataService, ISubScenariosDataResponse } from '@/application/dashboard/sub-scenarios/services/GetSubScenariosDataService';
import { SubScenariosPage } from '@/presentation/features/dashboard/sub-scenarios/components/SubScenariosPage';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { TOKENS } from '@/infrastructure/config/di/tokens';
import { serializeSubScenariosData } from '@/presentation/utils/serialization.utils';

interface SubScenariosRouteProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    scenarioId?: string;
    activityAreaId?: string;
    neighborhoodId?: string;
    active?: string;
  }>;
}

/**
 * Sub-Scenarios Page Route (Server Component)
 * 
 * Next.js App Router page that handles sub-scenarios listing.
 * Uses dependency injection to get data and render the presentation layer.
 */
export default async function SubScenariosRoute(props: SubScenariosRouteProps) {
  const searchParams = await props.searchParams;

  try {
    // Dependency Injection: Get container and resolve use case
    const container: IContainer = ContainerFactory.createContainer();
    const getSubScenariosDataService = container.get<GetSubScenariosDataService>(TOKENS.GetSubScenariosDataService);
    
    // Parse and validate search params
    const filters = {
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: searchParams.limit ? parseInt(searchParams.limit) : 7,
      search: searchParams.search || "",
      scenarioId: searchParams.scenarioId ? parseInt(searchParams.scenarioId) : undefined,
      activityAreaId: searchParams.activityAreaId ? parseInt(searchParams.activityAreaId) : undefined,
      neighborhoodId: searchParams.neighborhoodId ? parseInt(searchParams.neighborhoodId) : undefined,
      active: searchParams.active !== undefined
        ? searchParams.active === 'true'
        : undefined,
    };

    // Execute Application Service - returns pure Domain Entities
    const domainResult: ISubScenariosDataResponse = await getSubScenariosDataService.execute(filters);
    
    // Presentation Layer responsibility: Serialize domain entities for client components
    const serializedResult = serializeSubScenariosData(domainResult);
    
    // Render Presentation Layer with serialized data (plain objects)
    return (
      <SubScenariosPage
        initialData={serializedResult}
      />
    );

  } catch (error) {
    console.error('Error in SubScenariosRoute:', error);
    
    // TODO: Render proper error page/component
    throw error;
  }
}
