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
    reservationStateIds?: string | string[];
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
      reservationStateIds: searchParams.reservationStateIds
        ? Array.isArray(searchParams.reservationStateIds)
          ? searchParams.reservationStateIds.map(id => parseInt(id))
          : [parseInt(searchParams.reservationStateIds)]
        : undefined,
    };

    console.log('🔍 Page.tsx filters:', JSON.stringify(filters, null, 2));

    // DDD: Execute use case through service layer
    // All business logic, validation, and data fetching happens in domain/application layers
    const result: DashboardReservationsResponse = await reservationService.getDashboardReservations(filters);

    // Atomic Design: Render page template with clean separation
    return <DashboardReservationsPage initialData={result} />;

  } catch (error) {
    console.error('Unexpected error in DashboardRoute:', error);
    throw error;
  }
}
