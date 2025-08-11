import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/utils/utils";

export type StatusType = string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  customColor?: string;
  className?: string;
}

// Tipos de variante disponibles en el componente Badge
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// Definición de estados base y sus configuraciones
const statusConfigs: Record<
  string,
  { variant: BadgeVariant; label: string; color?: string }
> = {
  // Estados generales
  active: {
    variant: "default",
    label: "Activo",
    color: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  inactive: {
    variant: "secondary",
    label: "Inactivo",
    color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },

  // Estados para reservas
  approved: {
    variant: "default",
    label: "Aprobada",
    color: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  pending: {
    variant: "secondary",
    label: "Pendiente",
    color: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  rejected: {
    variant: "destructive",
    label: "Rechazada",
    color: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  canceled: {
    variant: "outline",
    label: "Cancelada",
    color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },

  // Añadir cualquier otro estado que pueda ser necesario
};

export function StatusBadge({
  status,
  label,
  customColor,
  className,
}: StatusBadgeProps) {
  // Convertir a lowercase para evitar problemas de coincidencia por mayúsculas/minúsculas
  const normalizedStatus = status.toLowerCase();

  // Buscar configuración para el estado, o usar una por defecto
  const config = statusConfigs[normalizedStatus] || {
    variant: "outline" as BadgeVariant,
    label: label || status, // Usar el status como label si no encuentra configuración
    color: customColor || "bg-blue-100 text-blue-800 hover:bg-blue-100", // Color por defecto
  };

  // Usar el label pasado como prop si está disponible
  const displayLabel = label || config.label;

  return (
    <Badge
      variant={config.variant}
      className={cn("rounded-md px-3 py-1", config.color, className)}
    >
      {displayLabel}
    </Badge>
  );
}
