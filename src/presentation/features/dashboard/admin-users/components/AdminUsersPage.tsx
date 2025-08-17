"use client";

import { createUserAction, updateUserAction, getUserByIdAction } from "@/infrastructure/web/controllers/dashboard/user.actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { DashboardPagination } from "@/shared/components/organisms/dashboard-pagination";
import { IAdminUsersDataClientResponse } from "@/presentation/utils/serialization.utils";
import { UserDrawer } from "@/presentation/features/dashboard/components/user-drawer";
import { useDashboardPagination } from "@/shared/hooks/use-dashboard-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { UserPlainObject } from "@/entities/user/domain/UserEntity";
import { Download, FileEdit, Plus, Search } from "lucide-react";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { useState } from "react";
import { toast } from "sonner";

// Type alias for cleaner code in this component
type User = UserPlainObject;

interface AdminUsersPageProps {
  initialData: IAdminUsersDataClientResponse;
}

export function AdminUsersPage({ initialData }: AdminUsersPageProps) {
  const router = useRouter();
  
  // Pagination and filters using standardized hook
  const {
    filters,
    onPageChange,
    onLimitChange,
    onSearch,
    onFilterChange,
    buildPageMeta,
  } = useDashboardPagination({
    baseUrl: '/dashboard/options',
    defaultLimit: 10,
  });

  // Local state from initial data
  const [users] = useState(initialData.users);
  const [roles] = useState(initialData.roles);
  const [filterOptions] = useState(initialData.filterOptions);

  // Build page meta from initial data
  const pageMeta = buildPageMeta(initialData.meta.totalItems);

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Handle filter changes
  const handleRoleChange = (roleId: string) => {
    onFilterChange({ roleId: roleId === 'all' ? undefined : roleId || undefined });
  };

  const handleStatusChange = (isActive: string) => {
    onFilterChange({ isActive: isActive === 'all' ? undefined : isActive || undefined });
  };

  // Export handler (placeholder - can be implemented later)
  const handleExport = async () => {
    try {
      setLoading(true);
      toast.info('Exportación de administradores en desarrollo...');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error al exportar administradores');
    } finally {
      setLoading(false);
    }
  };

  // User management handlers
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsDrawerOpen(true);
  };

  const handleOpenDrawer = async (user: User) => {
    try {
      setLoading(true);
      
      // Get full user details
      const result = await getUserByIdAction(user.id);
      
      if (result.success) {
        setSelectedUser(result.data);
        setIsDrawerOpen(true);
      } else {
        toast.error("Error al cargar administrador", {
          description: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error fetching admin user details:", error);
      toast.error("Error al cargar administrador");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDrawer = async (data: Partial<User>) => {
    try {
      const isUpdate = Boolean(selectedUser?.id);
      
      if (isUpdate) {
        // Update existing admin user
        const updateData = {
          dni: data.dni,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          roleId: data.roleId,
          neighborhoodId: data.neighborhoodId,
          isActive: data.isActive,
        };

        const result = await updateUserAction(selectedUser!.id, updateData);
        
        if (result.success) {
          toast.success("Administrador actualizado exitosamente");
          router.refresh();
        } else {
          toast.error("Error al actualizar administrador", {
            description: result.error,
          });
        }
      } else {
        // Create new admin user - ensure role is admin or super-admin
        const createData = {
          dni: data.dni!,
          firstName: data.firstName!,
          lastName: data.lastName!,
          email: data.email!,
          phone: data.phone!,
          address: data.address!,
          roleId: data.roleId! <= 2 ? data.roleId! : 2, // Default to admin if not super-admin
          neighborhoodId: data.neighborhoodId!,
          isActive: data.isActive ?? true,
        };

        const result = await createUserAction(createData);
        
        if (result.success) {
          toast.success("Administrador creado exitosamente");
          router.refresh();
        } else {
          toast.error("Error al crear administrador", {
            description: result.error,
          });
        }
      }
    } catch (error: any) {
      console.error("Error saving admin user:", error);
      toast.error("Error al guardar administrador");
    }
  };

  // Table columns definition
  const columns = [
    {
      id: "dni",
      header: "DNI",
      cell: (row: User) => <span>{row.dni}</span>,
    },
    {
      id: "name",
      header: "Nombre",
      cell: (row: User) => (
        <span>
          {(row.firstName || "") + " " + (row.lastName || "")}
        </span>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: (row: User) => <span>{row.email}</span>,
    },
    {
      id: "role",
      header: "Rol",
      cell: (row: User) => (
        <Badge variant={row.roleId === 1 ? "default" : "secondary"}>
          {row.roleId === 1 ? "Super Admin" : "Admin"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (row: User) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row: User) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenDrawer(row)}
          disabled={loading}
        >
          <FileEdit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      ),
    },
  ];

  // Render table component
  const renderTable = (data: User[], showPagination: boolean = true) => (
    <Card>
      <CardHeader className="pb-4">
        {/* Header row with title and actions button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle>Administradores</CardTitle>
            <Badge variant="outline">{data.length}</Badge>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Export button - visible on desktop */}
            <div className="hidden sm:flex">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
            
            {/* Mobile: Show/Hide filters button */}
            <div className="sm:hidden">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Search className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Filters section */}
        <div className={`space-y-4 ${showFilters ? 'block' : 'hidden'} sm:block`}>
          {/* Search bar - full width on mobile */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10 w-full"
              placeholder="Buscar por nombre, email o DNI..."
              value={filters.search || ''}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          {/* Filter selects - responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={filters.roleId?.toString() || 'all'} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {filterOptions.roles.map((role:any) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.isActive?.toString() || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filterOptions.status.map((status: any) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile export button */}
          <div className="sm:hidden">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              disabled={loading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Administradores
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns.map((col) => (
                  <th key={col.id} className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length ? (
                data.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col.id} className="px-4 py-3 text-sm">
                        {col.cell(user)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-sm text-gray-500">
                    No se encontraron administradores
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3 p-4">
          {data.length ? (
            data.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 space-y-2 bg-white hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {(user.firstName || "") + " " + (user.lastName || "")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.roleId === 1 ? "default" : "secondary"} className="text-xs">
                      {user.roleId === 1 ? "Super Admin" : "Admin"}
                    </Badge>
                    <StatusBadge status={user.isActive ? "active" : "inactive"} />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div>DNI: {user.dni}</div>
                  <div>Email: {user.email}</div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDrawer(user)}
                    disabled={loading}
                  >
                    <FileEdit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-sm text-gray-500">
              No se encontraron administradores
            </div>
          )}
        </div>
        
        {showPagination && (
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

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Administradores
            </h1>
            <p className="text-muted-foreground">
              Gestiona los usuarios administradores del sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Administrador
            </Button>
          </div>
        </div>

        {/* Single table view - no tabs */}
        {renderTable(users, true)}
      </div>

      {/* User Drawer - only allow admin roles */}
      <UserDrawer
        open={isDrawerOpen}
        user={selectedUser}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveDrawer}
        adminOnly={true} // Pass flag to limit roles to admin only
      />
    </>
  );
}