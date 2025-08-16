"use client";

import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PageMeta } from "@/shared/hooks/use-dashboard-pagination";

interface DashboardPaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  showLimitSelector?: boolean;
  limitOptions?: number[];
  className?: string;
}

/**
 * Componente de paginación estandarizado para dashboard
 * Basado en las mejores prácticas encontradas en el análisis
 */
export function DashboardPagination({
  meta,
  onPageChange,
  onLimitChange,
  showLimitSelector = true,
  limitOptions = [5, 7, 10, 20, 50],
  className = "",
}: DashboardPaginationProps) {
  const { page, limit, totalItems, totalPages, hasNext, hasPrev } = meta;

  // ─── Generate page numbers with ellipsis ──────────────────────────────────
  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (page < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  // ─── Calculate display range ───────────────────────────────────────────────
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  if (totalPages <= 1 && !showLimitSelector) {
    console.log("Retorna nulo");
    
    return null;
  }

  // console.log("Pagination Meta:", meta);
  // console.log('El limite que deberia ser: ', limit);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Results info and limit selector */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Mostrando {startItem} - {endItem} de {totalItems.toLocaleString()} resultados
        </span>
        
        {showLimitSelector && onLimitChange && (
          <div className="flex items-center gap-2">
            <span>Por página:</span>
            <Select value={limit.toString()} onValueChange={(value) => onLimitChange(Number(value))}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {limitOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!hasPrev}
            className="hidden sm:flex"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Anterior</span>
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === 'ellipsis') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                );
              }

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="min-w-[2.5rem]"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          {/* Next page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
          >
            <span className="hidden sm:inline mr-1">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNext}
            className="hidden sm:flex"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Componente simplificado para casos donde solo necesitas navegación básica
 */
export function SimplePagination({
  meta,
  onPageChange,
  className = "",
}: Pick<DashboardPaginationProps, 'meta' | 'onPageChange' | 'className'>) {
  return (
    <DashboardPagination
      meta={meta}
      onPageChange={onPageChange}
      showLimitSelector={false}
      className={className}
    />
  );
}

/**
 * Componente para múltiples entidades (como en Locations)
 */
interface MultiEntityPaginationProps {
  entityName: string;
  meta: PageMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export function MultiEntityPagination({
  entityName,
  meta,
  onPageChange,
  className = "",
}: MultiEntityPaginationProps) {
  const { page, totalItems, totalPages, hasNext, hasPrev } = meta;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-sm text-muted-foreground">
        {entityName}: {totalItems} resultados
      </span>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="px-3 py-1 text-sm">
          {page} / {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}