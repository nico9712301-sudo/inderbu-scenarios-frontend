import { createLocationsContainer } from '@/presentation/features/dashboard/locations/di/LocationsContainer.server';
import { LocationsPage } from '@/presentation/features/dashboard/locations/components/LocationsPage';

interface LocationsPageProps {
  searchParams: {
    tab?: string;
    communePage?: string;
    communeLimit?: string;
    communeSearch?: string;
    neighborhoodPage?: string;
    neighborhoodLimit?: string;
    neighborhoodSearch?: string;
  };
}

export default async function LocationsRoute(props: LocationsPageProps) {
  const searchParams = await props.searchParams;
  
  // DDD: Dependency injection - build complete container
  const { locationsService } = createLocationsContainer();

  try {
    // Parse search params with defaults for both entities
    const communeFilters = {
      page: searchParams.communePage ? parseInt(searchParams.communePage) : 1,
      limit: searchParams.communeLimit ? parseInt(searchParams.communeLimit) : 10,
      search: searchParams.communeSearch || "",
    };

    const neighborhoodFilters = {
      page: searchParams.neighborhoodPage ? parseInt(searchParams.neighborhoodPage) : 1,
      limit: searchParams.neighborhoodLimit ? parseInt(searchParams.neighborhoodLimit) : 10,
      search: searchParams.neighborhoodSearch || "",
    };

    // DDD: Execute use case through service layer
    // All business logic, validation, and data fetching happens in domain/application layers
    const result = await locationsService.getLocationsData(communeFilters, neighborhoodFilters);

    // Atomic Design: Render page template with clean separation
    return <LocationsPage initialData={result} />;

  } catch (error) {
    console.error('SSR Error in LocationsRoute:', error);

    // For unexpected errors, let Next.js error boundary handle it
    console.error('Unexpected error in LocationsRoute:', error);
    throw error;
  }
}
