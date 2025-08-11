import { GetUserReservationsResponse } from '@/presentation/features/reservations/use-cases/list/application/GetUserReservationsUseCase';
import { createUserReservationsContainer } from '@/presentation/features/reservations/di/ReservationsContainer.server';
import { AccessDeniedError, InvalidUserIdError } from '@/entities/user/domain/user-access.policy';
import { ReservationsPage } from '@/presentation/features/reservations/components/pages/reservations.page';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { userId } = await params;

  return {
    title: `Mis Reservas - Usuario ${userId}`,
    description: 'Gestiona todas tus reservas de escenarios deportivos desde un solo lugar.',
  };
}

export default async function UserReservationsPage({ params }: PageProps) {
  const { userId } = await params;

  // Dependency injection - build the complete DDD container
  const { reservationService } = createUserReservationsContainer();

  try {
    // Execute use case through service layer
    // All business logic, validation, and authorization happens in domain/application layers
    const result: GetUserReservationsResponse = await reservationService.getUserReservations(userId);

    // Render page component with clean separation
    return (
      <ReservationsPage
        userId={result.metadata.userId}
        initialData={result.reservations}
      />
    );

  } catch (error) {
    console.error(`SSR Error for user ${userId}:`, error);

    // Handle domain-specific errors with proper redirects
    if (error instanceof InvalidUserIdError) {
      console.warn(`Invalid user ID: ${userId}`);
      redirect('/404');
    }

    if (error instanceof AccessDeniedError) {
      console.warn(`Access denied for user: ${userId}`);
      redirect('/auth/login?redirect=' + encodeURIComponent(`/reservations/${userId}`));
    }

    // For unexpected errors, let Next.js error boundary handle it
    console.error('Unexpected error in UserReservationsRoute:', error);
    throw error;
  }
}