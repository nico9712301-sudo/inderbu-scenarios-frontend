"use client";

import { exportUsersToCSV } from "@/application/dashboard/clients/actions/ExportActions";
import { IClientsDataClientResponse } from "@/presentation/utils/serialization.utils";
import { UserDrawer } from "@/presentation/features/dashboard/components/user-drawer";
import { useClientsData } from "../../hooks/useClientsData";
import { useClientModal } from "../../hooks/useClientModal";
import { UserPlainObject } from "@/entities/user/domain/UserEntity";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Components
import { ClientsPageHeader } from "../organisms/clients-page-header";
import { ClientsTable } from "../organisms/clients-table";
import { ClientsMobileList } from "../organisms/clients-mobile-list";
import { PageMeta } from "@/shared/hooks/use-dashboard-pagination";
import { Dialog, DialogContent, DialogHeader } from "@/shared/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

type User = UserPlainObject;

interface ClientsPageProps {
  initialData: IClientsDataClientResponse;
}

export function ClientsPage({ initialData }: ClientsPageProps) {
  // Data management (filters, users, pagination)
  const {
    filters,
    users,
    meta,
    buildPageMeta,
    onSearch,
    onPageChange,
    onLimitChange,
    handleRoleChange,
    handleNeighborhoodChange,
    handleStatusChange,
  } = useClientsData(initialData);

  // Modal management (completely isolated)
  const {
    isDrawerOpen,
    selectedUser,
    handleCreateUser,
    handleOpenDrawer,
    handleCloseDrawer,
    handleSaveDrawer,
  } = useClientModal();

  // Build page meta (following scenarios pattern)
  const pageMeta: PageMeta = buildPageMeta(meta?.totalItems || 0);

  // Local UI state
  const [showFilters, setShowFilters] = useState(false);

  // Handlers
  const handleExport = async () => {
    try {
      await exportUsersToCSV();
      toast.success("Usuarios exportados exitosamente");
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error("Error al exportar usuarios");
    }
  };

  useEffect(() => {
    console.log("Filters changed from clients page:", filters);
  }, [filters]);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <ClientsPageHeader onCreateUser={handleCreateUser} />

        {/* Desktop Table */}
        <div className="hidden md:block">
          <ClientsTable
            users={users}
            filters={filters}
            pageMeta={pageMeta}
            loading={false}
            showFilters={showFilters}
            showPagination={true}
            onSearch={onSearch}
            onRoleChange={handleRoleChange}
            onNeighborhoodChange={handleNeighborhoodChange}
            onStatusChange={handleStatusChange}
            onExport={handleExport}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onEditUser={handleOpenDrawer}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        </div>

        {/* Mobile List */}
        <ClientsMobileList
          users={users}
          loading={false}
          onEditUser={handleOpenDrawer}
        />
      </div>

      {/* User Drawer */}
      <UserDrawer
        open={isDrawerOpen}
        user={selectedUser}
        onClose={handleCloseDrawer}
        onSave={handleSaveDrawer}
      />
    </>
  );
}
