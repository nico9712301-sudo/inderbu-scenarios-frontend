"use client";

import { AlertCircle, CheckCircle2, Clock, X } from "lucide-react";
import { Badge } from "@/shared/ui/badge";


interface StatusBadgeProps {
  status: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  variant?: "default" | "outline";
}

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  variant = "default",
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "CONFIRMADA":
        return {
          label: "Confirmada",
          icon: CheckCircle2,
          className:
            variant === "outline"
              ? "border-green-300 text-green-700 bg-green-50"
              : "bg-green-600 text-white border-green-600",
        };
      case "PENDIENTE":
        return {
          label: "Pendiente",
          icon: Clock,
          className:
            variant === "outline"
              ? "border-yellow-300 text-yellow-700 bg-yellow-50"
              : "bg-yellow-600 text-white border-yellow-600",
        };
      case "CANCELADA":
        return {
          label: "Cancelada",
          icon: X,
          className:
            variant === "outline"
              ? "border-red-300 text-red-700 bg-red-50"
              : "bg-red-600 text-white border-red-600",
        };
      case "RECHAZADA":
        return {
          label: "Rechazada",
          icon: AlertCircle,
          className:
            variant === "outline"
              ? "border-gray-300 text-gray-700 bg-gray-50"
              : "bg-gray-600 text-white border-gray-600",
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className:
            variant === "outline"
              ? "border-gray-300 text-gray-700 bg-gray-50"
              : "bg-gray-600 text-white border-gray-600",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <Badge
      variant={variant}
      className={`
        ${config.className} 
        ${sizeClasses[size]} 
        font-medium border transition-colors duration-200
        ${showIcon ? "flex items-center gap-1" : ""}
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}
