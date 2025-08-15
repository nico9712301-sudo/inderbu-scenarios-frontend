"use client";

import { createUserAction, updateUserAction, getUserByIdAction } from "@/infrastructure/web/controllers/dashboard/user.actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { DashboardPagination } from "@/shared/components/organisms/dashboard-pagination";
import { IClientsDataClientResponse } from "@/presentation/utils/serialization.utils";
import { UserDrawer } from "@/presentation/features/dashboard/components/user-drawer";
import { useDashboardPagination } from "@/shared/hooks/use-dashboard-pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
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


interface ClientsPageProps {
  initialData: IClientsDataClientResponse;
}

export function ClientsPage({ initialData }: ClientsPageProps) {
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
    baseUrl: '/dashboard/clients',
    defaultLimit: 10,
  });

  // Local state from initial data
  const [users] = useState(initialData.users);
  const [roles] = useState(initialData.roles);
  const [neighborhoods] = useState(initialData.neighborhoods);
  const [filterOptions] = useState(initialData.filterOptions);

  // Build page meta from initial data
  const pageMeta = buildPageMeta(initialData.meta.totalItems);

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle filter changes
  const handleRoleChange = (roleId: string) => {
    onFilterChange({ roleId: roleId === 'all' ? undefined : roleId || undefined });
  };

  const handleNeighborhoodChange = (neighborhoodId: string) => {
    onFilterChange({ neighborhoodId: neighborhoodId === 'all' ? undefined : neighborhoodId || undefined });
  };

  const handleStatusChange = (isActive: string) => {
    onFilterChange({ isActive: isActive === 'all' ? undefined : isActive || undefined });
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
        toast.error("Error al cargar usuario", {
          description: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      toast.error("Error al cargar usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDrawer = async (data: Partial<User>) => {
    try {
      const isUpdate = Boolean(selectedUser?.id);
      
      if (isUpdate) {
        // Update existing user
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
          toast.success("Usuario actualizado exitosamente");
          router.refresh();
        } else {
          toast.error("Error al actualizar usuario", {
            description: result.error,
          });
        }
      } else {
        // Create new user
        const createData = {
          dni: data.dni!,
          firstName: data.firstName!,
          lastName: data.lastName!,
          email: data.email!,
          phone: data.phone!,
          address: data.address!,
          roleId: data.roleId!,
          neighborhoodId: data.neighborhoodId!,
          isActive: data.isActive ?? true,
        };

        const result = await createUserAction(createData);
        
        if (result.success) {
          toast.success("Usuario creado exitosamente");
          router.refresh();
        } else {
          toast.error("Error al crear usuario", {
            description: result.error,
          });
        }
      }
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error("Error al guardar usuario");
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
          {(row.firstName || row.firstName || "") +
            " " +
            (row.lastName || row.lastName || "")}
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
      cell: (row: User) => <span>{row.role || "N/A"}</span>,
    },
    {
      id: "neighborhood",
      header: "Barrio",
      cell: (row: User) => <span>{row.neighborhoodId || "N/A"}</span>,
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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Listado de Usuarios</CardTitle>
            <Badge variant="outline">{data.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Buscar usuarios..."
                value={filters.search || ''}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
            <Select value={filters.roleId?.toString() || 'all'} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-40">
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
            <Select value={filters.neighborhoodId?.toString() || 'all'} onValueChange={handleNeighborhoodChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por barrio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los barrios</SelectItem>
                {filterOptions.neighborhoods.map((neighborhood:any) => (
                  <SelectItem key={neighborhood.value} value={neighborhood.value}>
                    {neighborhood.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.isActive?.toString() || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-32">
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
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
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
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

  // Filter users by role for tabs
  const filterUsersByRole = (roleName: string) => {
    return users.filter((user) => String(user.role) === roleName);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Usuarios
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="admin">Administradores</TabsTrigger>
              <TabsTrigger value="independiente">Independientes</TabsTrigger>
              <TabsTrigger value="club-deportivo">Clubes Deportivos</TabsTrigger>
              <TabsTrigger value="entrenador">Entrenadores</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            {renderTable(users, true)}
          </TabsContent>

          <TabsContent value="admin" className="mt-0">
            {renderTable(filterUsersByRole("admin"), false)}
          </TabsContent>

          <TabsContent value="independiente" className="mt-0">
            {renderTable(filterUsersByRole("independiente"), false)}
          </TabsContent>

          <TabsContent value="club-deportivo" className="mt-0">
            {renderTable(filterUsersByRole("club-deportivo"), false)}
          </TabsContent>

          <TabsContent value="entrenador" className="mt-0">
            {renderTable(filterUsersByRole("entrenador"), false)}
          </TabsContent>
        </Tabs>
      </div>

      {/* User Drawer */}
      <UserDrawer
        open={isDrawerOpen}
        user={selectedUser}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveDrawer}
      />
    </>
  );
}
