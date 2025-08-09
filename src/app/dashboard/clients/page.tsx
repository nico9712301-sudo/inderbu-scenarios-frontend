import { createClientsContainer } from '@/features/dashboard/clients/di/ClientsContainer.server';
import { ClientsPage } from '@/features/dashboard/clients/components/ClientsPage';

interface ClientsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    roleId?: string;
    neighborhoodId?: string;
    isActive?: string;
  };
}

export default async function ClientsRoute(props: ClientsPageProps) {
  const searchParams = await props.searchParams;
  
  // DDD: Dependency injection - build complete container
  const { clientsService } = createClientsContainer();

  try {
    // Parse search params with defaults
    const filters = {
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: searchParams.limit ? parseInt(searchParams.limit) : 10,
      search: searchParams.search || "",
      roleId: searchParams.roleId ? parseInt(searchParams.roleId) : undefined,
      neighborhoodId: searchParams.neighborhoodId ? parseInt(searchParams.neighborhoodId) : undefined,
      isActive: searchParams.isActive ? searchParams.isActive === 'true' : undefined,
    };

    // DDD: Execute use case through service layer
    // All business logic, validation, and data fetching happens in domain/application layers
    const result = await clientsService.getClientsData(filters);

    // Atomic Design: Render page template with clean separation
    return <ClientsPage initialData={result} />;

  } catch (error) {
    console.error('SSR Error in ClientsRoute:', error);

    // For unexpected errors, let Next.js error boundary handle it
    console.error('Unexpected error in ClientsRoute:', error);
    throw error;
  }
}
