import { createSubScenariosContainer } from '@/features/dashboard/sub-scenarios/di/SubScenariosContainer.server';
import { SubScenariosPage } from '@/features/dashboard/sub-scenarios/components/SubScenariosPage';
import { ISubScenariosDataResponse } from '@/features/dashboard/sub-scenarios/application/GetSubScenariosDataUseCase';

interface SubScenariosPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    scenarioId?: string;
    activityAreaId?: string;
    neighborhoodId?: string;
    active?: string;
  };
}

export default async function SubScenariosRoute(props: SubScenariosPageProps) {
  const searchParams = await props.searchParams;

  // DDD: Dependency injection - build complete container
  const { subScenariosService } = createSubScenariosContainer();

  try {
    // Parse search params with defaults
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

    // DDD: Execute use case through service layer
    // All business logic, validation, and data fetching happens in domain/application layers
    const result: ISubScenariosDataResponse = await subScenariosService.getSubScenariosData(filters);

    // Atomic Design: Render page template with clean separation
    return <SubScenariosPage initialData={result} />;

  } catch (error) {
    console.error('SSR Error in SubScenariosRoute:', error);

    // For unexpected errors, let Next.js error boundary handle it
    console.error('Unexpected error in SubScenariosRoute:', error);
    throw error;
  }
}
