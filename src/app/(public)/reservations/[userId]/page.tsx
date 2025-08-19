import {
  GetUserReservationsUseCase,
  IUserReservationsDataResponse,
} from "@/application/reservations/use-cases/GetUserReservationsUseCase";
import {
  IUserReservationsDataClientResponse,
  serializeUserReservationsData,
} from "@/presentation/utils/serialization.utils";
import { ReservationsPage } from "@/presentation/features/reservations/components/pages/reservations.page";
import { ContainerFactory } from "@/infrastructure/config/di/container.factory";
import { IContainer } from "@/infrastructure/config/di/simple-container";
import { TOKENS } from "@/infrastructure/config/di/tokens";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { userId } = await params;

  return {
    title: `Mis Reservas - Usuario ${userId}`,
    description:
      "Gestiona todas tus reservas de escenarios deportivos desde un solo lugar.",
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
    const getUserReservationsUseCase =
      container.get<GetUserReservationsUseCase>(
        TOKENS.GetUserReservationsUseCase
      );

    // Parse and validate user ID
    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber) || userIdNumber <= 0) {
      console.warn(`Invalid user ID: ${userId}`);
      redirect("/404");
    }

    // Execute Use Case - returns pure Domain Entities
    const domainResult: IUserReservationsDataResponse =
      await getUserReservationsUseCase.execute(userIdNumber);

    console.log(`SSR Result for user ${userId}:`, domainResult);

    // Presentation Layer responsibility: Serialize domain entities for client components
    const serializedResult: IUserReservationsDataClientResponse =
      serializeUserReservationsData(domainResult);

    console.log(`Serialized Result for user ${userId}:`, serializedResult);

    // Render Presentation Layer with serialized data (plain objects)
    return (
      <ReservationsPage
        userId={domainResult.metadata.userId}
        initialData={{
          data: serializedResult.reservations,
          meta: {
            page: serializedResult.metadata.page,
            limit: serializedResult.metadata.limit,
            totalItems: serializedResult.metadata.totalItems,
            totalPages: serializedResult.metadata.totalPages,
          },
        }}
      />
    );
  } catch (error) {
    console.error(`SSR Error for user ${userId}:`, error);

    // TODO: Handle domain-specific errors and render proper error page
    throw error;
  }
}
