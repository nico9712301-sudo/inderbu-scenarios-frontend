import { IScenariosDataResponse } from "@/features/dashboard/scenarios/application/GetScenariosDataUseCase";
import { IScenariosFilters } from "@/features/dashboard/scenarios/domain/repositories/IScenarioRepository";
import { createScenariosContainer } from "@/features/dashboard/scenarios/di/ScenariosContainer.server";
import { ScenariosPage } from "@/features/dashboard/scenarios/components/ScenariosPage";

interface ScenariosPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    neighborhoodId?: string;
    active?: string
  };
}

export default async function ScenariosRoute(props: ScenariosPageProps) {
  const searchParams = await props.searchParams;

  // DDD: Dependency injection - build complete container
  const { scenariosService } = createScenariosContainer();

  try {
    // Parse search params with defaults
    const filters = {
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

    // DDD: Execute use case through service layer
    // All business logic, validation, and data fetching happens in domain/application layers
    const result: IScenariosDataResponse =
      await scenariosService.getScenariosData(filters);

    const getScenarios = async (filters: IScenariosFilters) => {
      return await scenariosService.getScenarios(filters);
    };

    // Atomic Design: Render page template with clean separation
    return <ScenariosPage initialData={result} />;
  } catch (error) {
    console.error("SSR Error in ScenariosRoute:", error);

    // For unexpected errors, let Next.js error boundary handle it
    console.error("Unexpected error in ScenariosRoute:", error);
    throw error;
  }
}
