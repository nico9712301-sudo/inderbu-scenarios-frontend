"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
  const [hasError, setHasError] = useState(false);
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
        setHasError(false);
        try {
          await controller.executeStrategy(mode, data);

          // Resetear error en caso de éxito
          setHasError(false);

          // Post-procesamiento específico por modo
          if (mode === "register" || mode === "reset") {
            setCurrentMode("login");
          }
        } catch (error: any) {
          // CRÍTICO: Usar setState funcional para asegurar que el estado persista
          setHasError(prev => true);

          // IMPORTANTE: Re-lanzar el error para que login-form.tsx pueda capturarlo
          // login-form.tsx necesita recibir el error con fieldErrors para mostrarlo en el campo
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      isLoading,
    }),
    [controller, isLoading] // deps reales
  );

  // SIMPLICADO: Lógica directa sin race conditions
  const shouldStayOpen = isLoading || hasError;

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open && !shouldStayOpen) {
      // Solo cerrar si no hay operaciones ni errores
      setHasError(false);
      onClose();
    } else if (open) {
      setHasError(false);
    }
    // Si hay operaciones o errores, simplemente ignorar el intento de cierre
  }, [onClose, shouldStayOpen]);

  const formConfig = AuthFormFactory.createForm(currentMode);
  const FormComponent = formConfig.component;

  // Memorizar el handler para evitar problemas de serialización
  const formHandler = useMemo(
    () => createFormHandler(currentMode),
    [createFormHandler, currentMode]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{formConfig.title}</DialogTitle>
          <DialogDescription>{formConfig.description}</DialogDescription>
        </DialogHeader>

        <FormComponent
          {...formHandler}
          navigation={navigation}
        />
      </DialogContent>
    </Dialog>
  );
}
