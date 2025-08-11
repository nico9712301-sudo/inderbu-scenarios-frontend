"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { IModalController } from "@/presentation/features/auth/interfaces/modal-controller.interface";
import { AuthModalController } from "@/presentation/features/auth/controllers/auth-modal-controller";
import { IFormNavigation } from "@/presentation/features/auth/interfaces/form-navigation.interface";
import { IFormHandler } from "@/presentation/features/auth/interfaces/form-handler.interface";
import { AuthFormFactory } from "@/presentation/features/auth/utils/auth-form-factory";
import { AuthMode } from "@/presentation/features/auth/types/auth-mode.type";
import { useAuth } from "../../model/use-auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  
  const authService = useAuth();
  
  // FIX: Memorizar modalController con deps estables
  const modalController: IModalController = useMemo(
    () => ({
      isOpen,
      onClose,
      onSuccess: onLoginSuccess,
    }),
    [isOpen, onClose, onLoginSuccess]
  );

  // FIX: Controller estable
  const controller: AuthModalController = useMemo(
    () => new AuthModalController(authService, modalController),
    [authService, modalController]
  );

  // FIX: Navigation estable
  const navigation: IFormNavigation = useMemo(
    () => ({
      currentMode,
      onModeChange: setCurrentMode,
    }),
    [currentMode]
  );

  // FIX: createFormHandler con useCallback y deps reales
  const createFormHandler = useCallback(
    <TData,>(mode: AuthMode): IFormHandler<TData> => ({
      async onSubmit(data: TData) {
        setIsLoading(true);
        try {
          await controller.executeStrategy(mode, data);
          
          // Post-procesamiento específico por modo
          if (mode === "register" || mode === "reset") {
            setCurrentMode("login");
          }
        } finally {
          setIsLoading(false);
        }
      },
      isLoading,
    }),
    [controller, isLoading] // deps reales
  );

  const formConfig = AuthFormFactory.createForm(currentMode);
  const FormComponent = formConfig.component;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{formConfig.title}</DialogTitle>
          <DialogDescription>{formConfig.description}</DialogDescription>
        </DialogHeader>
        
        <FormComponent
          {...createFormHandler(currentMode)}
          navigation={navigation}
        />
      </DialogContent>
    </Dialog>
  );
}
