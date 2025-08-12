import { GetScenariosDataUseCase, IScenariosDataResponse } from '@/application/dashboard/scenarios/use-cases/GetScenariosDataUseCase';
import { ScenariosPage } from '@/presentation/features/dashboard/scenarios/pages/scenarios.page';
import { ScenarioFilters } from '@/entities/scenario/infrastructure/IScenarioRepository';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { TOKENS } from '@/infrastructure/config/di/tokens';

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
    const getScenariosDataUseCase = container.get<GetScenariosDataUseCase>(TOKENS.GetScenariosDataUseCase);
    
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

    // Execute Use Case through Application Layer
    const result: IScenariosDataResponse = await getScenariosDataUseCase.execute(filters);

    // Render Presentation Layer with server-side data
    return (
      <ScenariosPage
        initialData={result}
      />
    );

  } catch (error) {
    console.error('Error in ScenariosRoute:', error);
    
    // TODO: Render proper error page/component
    throw error;
  }
}
