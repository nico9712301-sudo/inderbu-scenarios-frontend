import { GetUserReservationsUseCase, IUserReservationsDataResponse } from '@/application/reservations/use-cases/GetUserReservationsUseCase';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { TOKENS } from '@/infrastructure/config/di/tokens';
import { ReservationsPage } from '@/presentation/features/reservations/components/pages/reservations.page';
import { redirect } from 'next/navigation';
import { serializeUserReservationsData } from '@/presentation/utils/serialization.utils';

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

/**
 * User Reservations Page Route (Server Component)
 * 
 * Next.js App Router page that handles user reservations listing.
 * Uses dependency injection to get data and render the presentation layer.
 */
export default async function UserReservationsPage({ params }: PageProps) {
  const { userId } = await params;

  try {
    // Dependency Injection: Get container and resolve use case
    const container: IContainer = ContainerFactory.createContainer();
    const getUserReservationsUseCase = container.get<GetUserReservationsUseCase>(TOKENS.GetUserReservationsUseCase);
    
    // Parse and validate user ID
    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber) || userIdNumber <= 0) {
      console.warn(`Invalid user ID: ${userId}`);
      redirect('/404');
    }

    // Execute Use Case - returns pure Domain Entities
    const domainResult: IUserReservationsDataResponse = await getUserReservationsUseCase.execute(userIdNumber);
    
    // Presentation Layer responsibility: Serialize domain entities for client components
    const serializedResult = serializeUserReservationsData(domainResult);
    
    // Render Presentation Layer with serialized data (plain objects)
    return (
      <ReservationsPage
        userId={domainResult.metadata.userId}
        initialData={serializedResult}
      />
    );

  } catch (error) {
    console.error(`SSR Error for user ${userId}:`, error);
    
    // TODO: Handle domain-specific errors and render proper error page
    throw error;
  }
}