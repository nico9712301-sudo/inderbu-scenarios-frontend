import { GetLocationsDataService, ILocationsDataResponse } from '@/application/dashboard/locations/services/GetLocationsDataService';
import { NeighborhoodFilters } from '@/entities/neighborhood/infrastructure/INeighborhoodRepository';
import { LocationsPage } from '@/presentation/features/dashboard/locations/pages/locations.page';
import { CommuneFilters } from '@/entities/commune/infrastructure/commune-repository.port';
import { serializeLocationsData } from '@/presentation/utils/serialization.utils';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { TOKENS } from '@/infrastructure/config/di/tokens';



interface LocationsRouteProps {
  searchParams: Promise<{
    tab?: string;
    communePage?: string;
    communeLimit?: string;
    communeSearch?: string;
    neighborhoodPage?: string;
    neighborhoodLimit?: string;
    neighborhoodSearch?: string;
  }>;
}

/**
 * Locations Page Route (Server Component)
 * 
 * Next.js App Router page that handles locations listing.
 * Uses dependency injection to get data and render the presentation layer.
 */
export default async function LocationsRoute(props: LocationsRouteProps) {
  const searchParams = await props.searchParams;

  try {
    // Dependency Injection: Get container and resolve service
    const container: IContainer = ContainerFactory.createContainer();
    const getLocationsDataService = container.get<GetLocationsDataService>(TOKENS.GetLocationsDataService);
    
    // Parse and validate search params
    const communeFilters: CommuneFilters = {
      page: searchParams.communePage ? parseInt(searchParams.communePage, 10) || 1 : 1,
      limit: searchParams.communeLimit ? parseInt(searchParams.communeLimit, 10) || 10 : 10,
      search: searchParams.communeSearch || "",
    };

    const neighborhoodFilters: NeighborhoodFilters = {
      page: searchParams.neighborhoodPage ? parseInt(searchParams.neighborhoodPage, 10) || 1 : 1,
      limit: searchParams.neighborhoodLimit ? parseInt(searchParams.neighborhoodLimit, 10) || 10 : 10,
      search: searchParams.neighborhoodSearch || "",
    };

    // Execute Use Case through Application Layer - returns pure Domain Entities
    const domainResult: ILocationsDataResponse = await getLocationsDataService.execute(communeFilters, neighborhoodFilters);
    
    // Presentation Layer responsibility: Serialize domain entities for client components
    const serializedResult = serializeLocationsData(domainResult);

    // Render Presentation Layer with serialized data (plain objects)
    return (
      <LocationsPage
        initialData={serializedResult}
      />
    );

  } catch (error) {
    console.error('Error in LocationsRoute:', error);
    
    // TODO: Render proper error page/component
    throw error;
  }
}
