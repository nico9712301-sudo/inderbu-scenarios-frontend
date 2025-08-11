"use client";

import { Button } from "@/shared/ui/button";
import { AuthMode } from "../../types/auth-mode.type";

interface FormNavigationProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function FormNavigation({ mode, onModeChange }: FormNavigationProps) {
  const getNavigationConfig = () => {
    switch (mode) {
      case "login":
        return [
          { label: "¿Olvidaste tu contraseña?", targetMode: "reset" as AuthMode },
          { label: "Crear cuenta", targetMode: "register" as AuthMode },
        ];
      case "register":
        return [
          { label: "¿Ya tienes cuenta? Inicia sesión", targetMode: "login" as AuthMode },
        ];
      case "reset":
        return [
          { label: "Volver a login", targetMode: "login" as AuthMode },
          { label: "Crear cuenta", targetMode: "register" as AuthMode },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationConfig();

  if (navigationItems.length === 0) return null;

  return (
    <div className="flex justify-between text-sm">
      {navigationItems.map((item, index) => (
        <Button 
          key={index}
          variant="link" 
          onClick={() => onModeChange(item.targetMode)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
