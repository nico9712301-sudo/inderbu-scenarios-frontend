"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";

interface StatusToggleDropdownProps {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function StatusToggleDropdown({
  isActive,
  onToggle,
  disabled = false,
}: StatusToggleDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 px-2.5 py-0.5 text-xs font-medium rounded-full
            ${isActive 
              ? "bg-orange-100 text-orange-800 hover:bg-orange-200" 
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          disabled={disabled}
        >
          {isActive ? "Activo" : "Inactivo"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-32">
        <DropdownMenuItem
          onClick={onToggle}
          disabled={disabled}
          className={isActive ? "text-gray-600" : "text-orange-600"}
        >
          {isActive ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}