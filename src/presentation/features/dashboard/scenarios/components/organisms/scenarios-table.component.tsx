"use client";

import { FileEdit, Loader2, Search } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { DashboardPagination } from "@/shared/components/organisms/dashboard-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PageMeta } from "@/shared/hooks/use-dashboard-pagination";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";

interface Column {
  id: string;
  header: string;
  cell: (row: any) => React.ReactNode;
}

interface Props {
  rows: any[]; // Keep as any for backward compatibility
  meta: PageMeta | null;
  loading: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onPageChange(page: number): void;
  onLimitChange?(limit: number): void;
  onEdit(row: any): void;
  onToggleStatus(row: any): void;
}

export function ScenariosTable({
  rows,
  meta,
  loading,
  searchValue,
  onSearchChange,
  onPageChange,
  onLimitChange,
  onEdit,
  onToggleStatus,
}: Props) {
  const columns: Column[] = [
    {
      id: "neighborhood",
      header: "Barrio",
      cell: (r) => r.neighborhood?.name ?? "—",
    },
    { id: "name", header: "Nombre", cell: (r) => r.name },
    { id: "address", header: "Dirección", cell: (r) => r.address },
    {
      id: "status",
      header: "Estado",
      cell: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2.5 py-0.5 text-xs font-medium rounded-full
                ${r.active 
                  ? "bg-orange-100 text-orange-800 hover:bg-orange-200" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
            >
              {r.active ? "Activo" : "Inactivo"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-32">
            <DropdownMenuItem
              onClick={() => onToggleStatus(r)}
              disabled={!onToggleStatus}
              className={r.active ? "text-gray-600" : "text-orange-600"}
            >
              {r.active ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (r: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={() => onEdit(r)}
          >
            <FileEdit className="h-4 w-4 mr-1" /> Editar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Listado de Escenarios</CardTitle>
            <Badge variant="outline">{meta?.totalItems ?? 0}</Badge>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar…"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns.map((c) => (
                  <th
                    key={c.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500"
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2 inline-block" />{" "}
                    Cargando…
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    {columns.map((c) => (
                      <td key={c.id} className="px-4 py-3 text-sm">
                        {c.cell(r)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-8 text-center text-sm text-gray-500"
                  >
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="border-t p-4">
            <DashboardPagination
              meta={meta}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
              showLimitSelector={!!onLimitChange} // el doble !! se usa para forzar a booleano
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
