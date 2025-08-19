"use client";

import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { DashboardPagination } from "@/shared/components/organisms/dashboard-pagination";
import { ClientsExportButton } from "../atoms/clients-export-button";
import { ClientsTableHeader } from "../molecules/clients-table-header";
import { ClientsFiltersCard, ClientsFilters } from "../molecules/clients-filters-card";
import { ClientsTableRow } from "../molecules/clients-table-row";
import { UserPlainObject } from "@/entities/user/domain/UserEntity";
import { PageMeta } from "@/shared/hooks/use-dashboard-pagination";

interface ClientsTableProps {
  users: UserPlainObject[];
  filters: ClientsFilters;
  showFilters: boolean;
  loading: boolean;
  pageMeta: PageMeta;
  showPagination?: boolean;
  onSearch: (value: string) => void;
  onRoleChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onExport: () => Promise<void>;
  onToggleFilters: () => void;
  onEditUser: (user: UserPlainObject) => void;
  onToggleStatus: (user: UserPlainObject) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

const TABLE_COLUMNS = [
  { id: "dni", header: "DNI" },
  { id: "name", header: "Nombre" },
  { id: "email", header: "Email" },
  { id: "role", header: "Rol" },
  { id: "neighborhood", header: "Barrio" },
  { id: "status", header: "Estado" },
  { id: "actions", header: "Acciones" },
];

export function ClientsTable({
  users,
  filters,
  showFilters,
  loading,
  pageMeta,
  showPagination = true,
  onSearch,
  onRoleChange,
  onNeighborhoodChange,
  onStatusChange,
  onExport,
  onToggleFilters,
  onEditUser,
  onToggleStatus,
  onPageChange,
  onLimitChange,
}: ClientsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        {/* Header row with title and actions button */}
        <ClientsTableHeader
          clientsCount={users.length}
          loading={loading}
          showFilters={showFilters}
          onExport={onExport}
          onToggleFilters={onToggleFilters}
        />

        {/* Filters section */}
        <ClientsFiltersCard
          filters={filters}
          onSearch={onSearch}
          onRoleChange={onRoleChange}
          onNeighborhoodChange={onNeighborhoodChange}
          onStatusChange={onStatusChange}
          showFilters={showFilters}
        />

        {/* Mobile export button */}
        <div className="sm:hidden">
          <ClientsExportButton
            onExport={onExport}
            loading={loading}
            className="w-full"
            showText={true}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {TABLE_COLUMNS.map((col) => (
                  <th
                    key={col.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length ? (
                users.map((user) => (
                  <ClientsTableRow
                    key={user.id}
                    user={user}
                    loading={loading}
                    onEdit={onEditUser}
                    onToggleStatus={onToggleStatus}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={TABLE_COLUMNS.length}
                    className="p-8 text-center text-sm text-gray-500"
                  >
                    No se encontraron clientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showPagination && onPageChange && onLimitChange && (
          <div className="border-t p-4">
            <DashboardPagination
              meta={pageMeta}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
              showLimitSelector={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}