"use client";

import { Button } from "@/shared/ui/button";
import { Search } from "lucide-react";

interface MobileFiltersToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileFiltersToggle({
  isOpen,
  onToggle,
}: MobileFiltersToggleProps) {
  return (
    <div className="sm:hidden">
      <Button variant="outline" size="sm" onClick={onToggle}>
        <Search className="h-4 w-4 mr-2" />
        Filtros
      </Button>
    </div>
  );
}