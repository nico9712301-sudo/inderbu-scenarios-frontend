"use client";

import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";


interface ClientsPageHeaderProps {
  onCreateUser: () => void;
}

export function ClientsPageHeader({ onCreateUser }: ClientsPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-2xl font-bold tracking-tight">
        Gestión de Clientes
      </h1>
      <div className="flex items-center gap-2">
        <Button onClick={onCreateUser}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>
    </div>
  );
}