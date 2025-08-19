"use client";

import { UserPlainObject } from "@/entities/user/domain/UserEntity";
import { ClientsMobileCard } from "../molecules/clients-mobile-card";

interface ClientsMobileListProps {
  users: UserPlainObject[];
  loading: boolean;
  onEditUser: (user: UserPlainObject) => void;
  onToggleStatus: (user: UserPlainObject) => void;
}

export function ClientsMobileList({
  users,
  loading,
  onEditUser,
  onToggleStatus,
}: ClientsMobileListProps) {
  return (
    <div className="md:hidden space-y-3 p-4">
      {users.length ? (
        users.map((user) => (
          <ClientsMobileCard
            key={user.id}
            user={user}
            loading={loading}
            onEdit={onEditUser}
            onToggleStatus={onToggleStatus}
          />
        ))
      ) : (
        <div className="text-center py-8 text-sm text-gray-500">
          No se encontraron clientes
        </div>
      )}
    </div>
  );
}