"use client";

import { CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { ClientsExportButton } from "../atoms/clients-export-button";
import { MobileFiltersToggle } from "../atoms/mobile-filters-toggle";

interface ClientsTableHeaderProps {
  clientsCount: number;
  loading: boolean;
  showFilters: boolean;
  onExport: () => Promise<void>;
  onToggleFilters: () => void;
}

export function ClientsTableHeader({
  clientsCount,
  loading,
  showFilters,
  onExport,
  onToggleFilters,
}: ClientsTableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-2">
        <CardTitle>Listado de Clientes</CardTitle>
        <Badge variant="outline">{clientsCount}</Badge>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Export button - visible on desktop */}
        <div className="hidden sm:flex">
          <ClientsExportButton
            onExport={onExport}
            loading={loading}
          />
        </div>

        {/* Mobile: Show/Hide filters button */}
        <MobileFiltersToggle
          isOpen={showFilters}
          onToggle={onToggleFilters}
        />
      </div>
    </div>
  );
}