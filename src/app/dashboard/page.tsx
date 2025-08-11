import { createDashboardReservationsContainer } from '@/presentation/features/dashboard/reservations/di/DashboardReservationsContainer.server';
import { DashboardReservationsResponse } from '@/presentation/features/dashboard/reservations/application/GetDashboardReservationsUseCase';
import { DashboardReservationsPage } from '@/presentation/features/dashboard/reservations/components/DashboardReservationsPage';

interface DashboardPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    scenarioId?: string;
    activityAreaId?: string;
    neighborhoodId?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export default async function DashboardRoute(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  
  // DDD: Dependency injection - build complete container
  const { reservationService } = createDashboardReservationsContainer();

  try {
    // Parse search params with defaults
    const filters = {
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: searchParams.limit ? parseInt(searchParams.limit) : 7,
      scenarioId: searchParams.scenarioId ? parseInt(searchParams.scenarioId) : undefined,
      activityAreaId: searchParams.activityAreaId ? parseInt(searchParams.activityAreaId) : undefined,
      neighborhoodId: searchParams.neighborhoodId ? parseInt(searchParams.neighborhoodId) : undefined,
      userId: searchParams.userId ? parseInt(searchParams.userId) : undefined,
      dateFrom: searchParams.dateFrom || undefined,
      dateTo: searchParams.dateTo || undefined,
    };

    // DDD: Execute use case through service layer
    // All business logic, validation, and data fetching happens in domain/application layers
    const result: DashboardReservationsResponse = await reservationService.getDashboardReservations(filters);

    // Atomic Design: Render page template with clean separation
    return <DashboardReservationsPage initialData={result} />;

  } catch (error) {
    console.error('SSR Error in DashboardRoute:', error);
    // For unexpected errors, let Next.js error boundary handle it
    console.error('Unexpected error in DashboardRoute:', error);
    throw error;
  }
}
