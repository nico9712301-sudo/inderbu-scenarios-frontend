import { GetHomeDataUseCase } from '@/application/home/use-cases/GetHomeDataUseCase';
import { HomePage } from '@/presentation/features/home/components/pages/home.page';
import { IHomeDataResponse } from '@/application/home/services/GetHomeDataService';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { serializeHomeData } from '@/presentation/utils/serialization.utils';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { homeSlidesService } from '@/shared/api/home-slides';
import { TOKENS } from '@/infrastructure/config/di/tokens';


interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    activityAreaId?: string;
    neighborhoodId?: string;
    hasCost?: string;
  }>;
}

/**
 * Home Page Route (Server Component)
 * 
 * Next.js App Router page that handles home page data loading.
 * Uses dependency injection to get data and render the presentation layer.
 */
export default async function HomeRoute(props: HomePageProps) {
  const searchParams = await props.searchParams;

  try {
    // Dependency Injection: Get container and resolve use case
    const container: IContainer = ContainerFactory.createContainer();
    const getHomeDataUseCase = container.get<GetHomeDataUseCase>(TOKENS.GetHomeDataUseCase);
    
    // Parse and validate search params
    const filters = {
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: searchParams.limit ? parseInt(searchParams.limit) : 6,
      search: searchParams.search || "",
      activityAreaId: searchParams.activityAreaId ? parseInt(searchParams.activityAreaId) : undefined,
      neighborhoodId: searchParams.neighborhoodId ? parseInt(searchParams.neighborhoodId) : undefined,
      hasCost: searchParams.hasCost !== undefined
        ? searchParams.hasCost === 'true'
        : undefined,
    };

    // Execute Use Case and fetch slides in parallel
    const [domainResult, homeSlides] = await Promise.all([
      getHomeDataUseCase.execute(filters),
      homeSlidesService.getHomeBanners(), // Server-side call
    ]);

    // Presentation Layer responsibility: Serialize domain entities for client components
    const serializedResult = serializeHomeData(domainResult);
    
    // Render Presentation Layer with serialized data (plain objects)
    return (
      <HomePage
        initialData={serializedResult}
        slides={homeSlides}
      />
    );

  } catch (error) {
    console.error('Error in HomeRoute:', error);
    
    // TODO: Handle domain-specific errors and render proper error page
    throw error;
  }
}
