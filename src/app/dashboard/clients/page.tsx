import {
  GetClientsDataService,
  IClientsDataResponse,
} from "@/application/dashboard/clients/services/GetClientsDataService";
import {
  IClientsDataClientResponse,
  serializeClientsData,
} from "@/presentation/utils/serialization.utils";
import { ClientsPage } from "@/presentation/features/dashboard/clients/components/ClientsPage";
import { ContainerFactory } from "@/infrastructure/config/di/container.factory";
import { UserFilters } from "@/entities/user/infrastructure/IUserRepository";
import { IContainer } from "@/infrastructure/config/di/simple-container";
import { TOKENS } from "@/infrastructure/config/di/tokens";
import { EUserRole } from "@/shared/enums/user-role.enum";

interface ClientsRouteProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    roleId?: string;
    neighborhoodId?: string;
    isActive?: string;
  }>;
}

/**
 * Clients Page Route (Server Component)
 *
 * Next.js App Router page that handles clients listing.
 * Uses dependency injection to get data and render the presentation layer.
 */
export default async function ClientsRoute(props: ClientsRouteProps) {
  const searchParams = await props.searchParams;

  try {
    // Dependency Injection: Get container and resolve use case
    const container: IContainer = ContainerFactory.createContainer();
    const getClientsDataService: GetClientsDataService =
      container.get<GetClientsDataService>(TOKENS.GetClientsDataService);

    // Parse and validate search params
    const filters: UserFilters = {
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: searchParams.limit ? parseInt(searchParams.limit) : 10,
      search: searchParams.search || "",
      roleId: searchParams.roleId
        ? Array.isArray(searchParams.roleId)
          ? searchParams.roleId.map((id) => parseInt(id))
          : [parseInt(searchParams.roleId)]
        : [EUserRole.CLUB_DEPORTIVO, EUserRole.ENTRENADOR, EUserRole.INDEPENDIENTE],
      neighborhoodId: searchParams.neighborhoodId
        ? parseInt(searchParams.neighborhoodId)
        : undefined,
      isActive:
        searchParams.isActive !== undefined
          ? searchParams.isActive === "true"
          : undefined,
    };

    // Execute Use Case through Application Layer - returns pure Domain Entities
    const clientsData: IClientsDataResponse =
      await getClientsDataService.execute(filters);
    console.log("Clients Data:", clientsData);

    // Presentation Layer responsibility: Serialize domain entities for client components
    const serializedResult: IClientsDataClientResponse =
      serializeClientsData(clientsData);
    console.log("Serialized Result:", serializedResult);

    return <ClientsPage initialData={serializedResult} />;
  } catch (error) {
    console.error("Error in ClientsRoute:", error);

    // TODO: Render proper error page/component
    throw error;
  }
}
