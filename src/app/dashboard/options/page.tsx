import { GetAdminUsersDataService, IAdminUsersDataResponse } from '@/application/dashboard/admin-users/services/GetAdminUsersDataService';
import { IAdminUsersDataClientResponse, serializeAdminUsersData } from '@/presentation/utils/serialization.utils';
import { OptionsPageWithTabs } from '@/presentation/features/dashboard/options/components/pages/options-page-with-tabs';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { UserFilters } from '@/entities/user/infrastructure/IUserRepository';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { TOKENS } from '@/infrastructure/config/di/tokens';
import { EUserRole } from '@/shared/enums/user-role.enum';

interface OptionsRouteProps {
  searchParams: Promise<{
    tab?: 'admins' | 'banners' | 'templates';
    page?: string;
    limit?: string;
    search?: string;
    roleId?: string;
    isActive?: string;
  }>;
}

/**
 * Options Page Route (Server Component)
 * 
 * Next.js App Router page that handles options with tabs for admins and banners.
 * Uses dependency injection to get data and render the presentation layer.
 */
export default async function OptionsRoute(props: OptionsRouteProps) {
  const searchParams = await props.searchParams;
  const currentTab = searchParams.tab || 'admins';

  try {
    // Only load admin data if we're on the admins tab
    let adminUsersData: IAdminUsersDataClientResponse | null = null;
    
    if (currentTab === 'admins') {
      // Dependency Injection: Get container and resolve use case
      const container: IContainer = ContainerFactory.createContainer();
      const getAdminUsersDataService: GetAdminUsersDataService = container.get<GetAdminUsersDataService>(TOKENS.GetAdminUsersDataService);
      
      // Parse and validate search params for admin users
      const filters: UserFilters = {
        page: searchParams.page ? parseInt(searchParams.page) : 1,
        limit: searchParams.limit ? parseInt(searchParams.limit) : 10,
        search: searchParams.search || "",
        roleId: searchParams.roleId
          ? Array.isArray(searchParams.roleId)
            ? searchParams.roleId.map((id) => parseInt(id))
            : [parseInt(searchParams.roleId)]
          : [EUserRole.ADMIN], // Business rule: only admin roles for options
        active: searchParams.isActive !== undefined
          ? searchParams.isActive === 'true'
          : undefined,
      };

      // Execute Use Case through Application Layer - returns pure Domain Entities
      const adminData: IAdminUsersDataResponse = await getAdminUsersDataService.execute(filters);
      console.log("Admin Data Fetched:", adminData);
      

      // Presentation Layer responsibility: Serialize domain entities for client components
      adminUsersData = serializeAdminUsersData(adminData);
    }

    return (
      <OptionsPageWithTabs
        currentTab={currentTab}
        adminUsersData={adminUsersData}
      />
    );

  } catch (error) {
    console.error('Error in OptionsRoute:', error);
    
    // TODO: Render proper error page/component
    throw error;
  }
}
