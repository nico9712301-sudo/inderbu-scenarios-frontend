import { GetAdminUsersDataService, IAdminUsersDataResponse } from '@/application/dashboard/admin-users/services/GetAdminUsersDataService';
import { IAdminUsersDataClientResponse, serializeAdminUsersData } from '@/presentation/utils/serialization.utils';
import { AdminUsersPage } from '@/presentation/features/dashboard/admin-users/components/AdminUsersPage';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { UserFilters } from '@/entities/user/infrastructure/IUserRepository';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { TOKENS } from '@/infrastructure/config/di/tokens';

interface AdminUsersRouteProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    roleId?: string;
    isActive?: string;
  }>;
}

/**
 * Admin Users Page Route (Server Component)
 * 
 * Next.js App Router page that handles admin users listing.
 * Uses dependency injection to get data and render the presentation layer.
 */
export default async function AdminUsersRoute(props: AdminUsersRouteProps) {
  const searchParams = await props.searchParams;

  try {
    // Dependency Injection: Get container and resolve use case
    const container: IContainer = ContainerFactory.createContainer();
    const getAdminUsersDataService: GetAdminUsersDataService = container.get<GetAdminUsersDataService>(TOKENS.GetAdminUsersDataService);
    
    // Parse and validate search params
    const filters: UserFilters = {
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: searchParams.limit ? parseInt(searchParams.limit) : 10,
      search: searchParams.search || "",
      roleId: searchParams.roleId
        ? parseInt(searchParams.roleId)
        : undefined,
      isActive: searchParams.isActive !== undefined
        ? searchParams.isActive === 'true'
        : undefined,
      adminOnly: true, // Always filter to admin users only
    };

    // Execute Use Case through Application Layer - returns pure Domain Entities
    const adminUsersData: IAdminUsersDataResponse = await getAdminUsersDataService.execute(filters);

    // Presentation Layer responsibility: Serialize domain entities for client components
    const serializedResult: IAdminUsersDataClientResponse = serializeAdminUsersData(adminUsersData);

    return (
      <AdminUsersPage
        initialData={serializedResult}
      />
    );

  } catch (error) {
    console.error('Error in AdminUsersRoute:', error);
    
    // TODO: Render proper error page/component
    throw error;
  }
}
