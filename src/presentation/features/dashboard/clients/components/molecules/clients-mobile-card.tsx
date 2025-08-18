"use client";

import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";
import { UserPlainObject } from "@/entities/user/domain/UserEntity";
import { FileEdit } from "lucide-react";

interface ClientsMobileCardProps {
  user: UserPlainObject;
  loading: boolean;
  onEdit: (user: UserPlainObject) => void;
}

export function ClientsMobileCard({ user, loading, onEdit }: ClientsMobileCardProps) {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <div className="border rounded-lg p-4 space-y-2 bg-white hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="font-medium">{fullName}</div>
        <StatusBadge status={user.active ? "active" : "inactive"} />
      </div>
      <div className="text-sm text-gray-600">
        <div>DNI: {user.dni}</div>
        <div>Email: {user.email}</div>
        <div>Rol: {user.role.name || "N/A"}</div>
        {user.neighborhood && (
          <div>Barrio: {user.neighborhood.name}</div>
        )}
      </div>
      <div className="flex justify-end pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(user)}
          disabled={loading}
        >
          <FileEdit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </div>
    </div>
  );
}