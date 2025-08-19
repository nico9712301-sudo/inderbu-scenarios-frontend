"use client";

import { Button } from "@/shared/ui/button";
import { StatusToggleDropdown } from "@/shared/ui/status-toggle-dropdown";
import { UserPlainObject } from "@/entities/user/domain/UserEntity";
import { FileEdit } from "lucide-react";

interface ClientsTableRowProps {
  user: UserPlainObject;
  loading: boolean;
  onEdit: (user: UserPlainObject) => void;
  onToggleStatus: (user: UserPlainObject) => void;
}

export function ClientsTableRow({ user, loading, onEdit, onToggleStatus }: ClientsTableRowProps) {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">
        <span>{user.dni}</span>
      </td>
      <td className="px-4 py-3 text-sm">
        <span>{fullName}</span>
      </td>
      <td className="px-4 py-3 text-sm">
        <span>{user.email}</span>
      </td>
      <td className="px-4 py-3 text-sm">
        <span>{user.role.name || "N/A"}</span>
      </td>
      <td className="px-4 py-3 text-sm">
        <span>{user.neighborhood?.name || "N/A"}</span>
      </td>
      <td className="px-4 py-3 text-sm">
        <StatusToggleDropdown
          isActive={user.active}
          onToggle={() => onToggleStatus(user)}
          disabled={loading}
        />
      </td>
      <td className="px-4 py-3 text-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(user)}
          disabled={loading}
        >
          <FileEdit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </td>
    </tr>
  );
}