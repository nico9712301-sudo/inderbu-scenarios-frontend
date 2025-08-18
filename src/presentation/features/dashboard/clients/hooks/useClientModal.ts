"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlainObject } from "@/entities/user/domain/UserEntity";
import {
  createUserAction,
  updateUserAction,
} from "@/infrastructure/web/controllers/dashboard/user.actions";

type User = UserPlainObject;

export function useClientModal() {
  // Modal state - completely isolated from filters
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const router = useRouter();

  // Handlers - isolated and don't affect URL
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsDrawerOpen(true);
  };

  const handleOpenDrawer = (user: User) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
  };

  const handleSaveDrawer = async (userData: any): Promise<any> => {
    try {
      let result: any;

      if (selectedUser) {
        // Update existing user
        result = await updateUserAction(selectedUser.id, userData);
      } else {
        // Create new user
        result = await createUserAction(userData);
      }

      if (result.success) {
        handleCloseDrawer();
        router.refresh();
        toast.success(
          selectedUser ? `Usuario ${result.data.firstName} ${result.data.lastName} actualizado correctamente` : `Usuario ${result.data.firstName} ${result.data.lastName} creado exitosamente`
        );
      } else {
        toast.error(result.message || "Error al procesar la solicitud");
      }

      return result;
    } catch (error) {
      console.error("Error saving user:", error);
      const errorResult: any = {
        success: false,
        message: "Error interno del servidor",
      };
      toast.error("Error interno del servidor");
      return errorResult;
    }
  };

  return {
    // State
    isDrawerOpen,
    selectedUser,
    
    // Handlers
    handleCreateUser,
    handleOpenDrawer,
    handleCloseDrawer,
    handleSaveDrawer,
  };
}