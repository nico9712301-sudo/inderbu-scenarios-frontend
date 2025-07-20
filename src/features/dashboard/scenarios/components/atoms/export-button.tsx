"use client";

import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useScenariosExport } from "../../hooks/use-scenarios-export";
import { ExportScenariosOptions } from "../../services/export.service";

interface ExportButtonProps {
  filters?: ExportScenariosOptions['filters'];
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export function ExportButton({ 
  filters, 
  disabled = false,
  variant = "outline",
  size = "sm" 
}: ExportButtonProps) {
  const {
    isExporting,
    canExport,
    exportAsExcel,
    exportAsCsv,
    exportWithFilters,
    currentJob,
    statusText,
    progressText,
  } = useScenariosExport({
    defaultOptions: { filters }
  });

  const handleExportExcel = () => {
    exportWithFilters(filters, 'xlsx');
  };

  const handleExportCsv = () => {
    exportWithFilters(filters, 'csv');
  };

  const handleExportAll = () => {
    exportAsExcel();
  };

  const isDisabled = disabled || !canExport;

  // Show status if exporting
  if (isExporting && currentJob) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {statusText} {progressText}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isDisabled}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          Exportar como Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCsv}>
          <FileText className="h-4 w-4 mr-2 text-blue-600" />
          Exportar como CSV
        </DropdownMenuItem>
        
        {filters && Object.keys(filters).length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportAll}>
              <Download className="h-4 w-4 mr-2 text-gray-600" />
              Exportar todos los datos
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}