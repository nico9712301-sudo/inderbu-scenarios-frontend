"use client";

import { Button } from "@/shared/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";


interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - 2);
    const rangeEnd = Math.min(totalPages - 1, currentPage + 2);

    // Add ellipsis if needed before range
    if (rangeStart > 2) {
      pages.push("...");
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed after range
    if (rangeEnd < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page if not already included
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8">

      {/* Navigation */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          className="px-4 py-2 border-border text-foreground hover:bg-muted 
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   transition-all duration-200 rounded-lg"
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) =>
            typeof page === "number" ? (
              <Button
                key={index}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                className={`w-10 h-10 p-0 rounded-lg transition-all duration-200 cursor-pointer ${
                  currentPage === page
                    ? "bg-primary hover:bg-primary-700 text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-muted "
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="px-2 text-muted-foreground text-sm">
                ⋯
              </span>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          className="px-4 py-2 border-border text-foreground hover:bg-muted 
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   transition-all duration-200 rounded-lg cursor-pointer"
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
            {/* Page info */}
            <div className="text-sm text-muted-foreground">
        Página <span className="font-medium">{currentPage}</span> de{" "}
        <span className="font-medium">{totalPages}</span>
      </div>
    </div>
  );
}
