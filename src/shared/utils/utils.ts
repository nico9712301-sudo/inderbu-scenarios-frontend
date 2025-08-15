'use client'

import { EUserRole } from "@/shared/enums/user-role.enum";
import { type ClassValue, clsx } from "clsx";
import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTodayLocalISO(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0"); // Mes: 0‑11 → +1
  const dd = String(now.getDate()).padStart(2, "0"); // Día del mes
  return `${yyyy}-${mm}-${dd}`;
}

export const getStatusBadgeClass = (state?: string) => {
    switch (state) {
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "CONFIRMADA":
        return "bg-green-100 text-green-800 border-green-300";
      case "CANCELADA":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

export function decodeJWT(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

// Mapeo de los estados de reserva que vienen del backend a los que usa el frontend
export const reservationStateMap: Record<string, string> = {
  PENDIENTE: "pending",
  CONFIRMADA: "approved",
  RECHAZADA: "rejected",
  CANCELADA: "canceled",
};

// Colores para los estados
export const stateColors: Record<string, string> = {
  pending: "#f59e0b", // Amber/Orange
  approved: "#22c55e", // Green
  rejected: "#ef4444", // Red
  canceled: "#6b7280", // Gray
};

// IDs de los estados en el backend
export const reservationStateIds: Record<string, number> = {
  PENDIENTE: 1,
  CONFIRMADA: 2,
  RECHAZADA: 3,
  CANCELADA: 4,
};

// Mapeo inverso de ID a estado
export const reservationStateById: Record<
  number,
  "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA"
> = {
  1: "PENDIENTE",
  2: "CONFIRMADA",
  3: "RECHAZADA",
  4: "CANCELADA",
};

// Utilidad para mapear estados entre backend y frontend
export function mapReservationState(backendState: string): string {
  return reservationStateMap[backendState] || "pending";
}

// Utilidad para mapear estados entre frontend y backend
export function getReservationStateId(frontendState: string): number {
  // Invertir el mapeo para buscar por valor
  const backendState = Object.keys(reservationStateMap).find(
    (key) => reservationStateMap[key] === frontendState
  );

  return backendState ? reservationStateIds[backendState] : 1; // Default a PENDIENTE (1)
}

// Utilidad para obtener el color de un estado
export function getStateColor(state: string): string {
  return stateColors[state] || stateColors["pending"];
}

// Función para formatear fecha
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("es-ES", options);
}

export const getRedirectPath = (
  userRole: EUserRole | undefined = undefined
): string => {
  switch (userRole) {
    case EUserRole.INDEPENDIENTE:
    case EUserRole.CLUB_DEPORTIVO:
    case EUserRole.ENTRENADOR:
      return "/";
    default:
      return "/dashboard";
  }
};

export function getRoleDisplayName(role: EUserRole): string {
  const names = {
    [EUserRole.SUPER_ADMIN]: "Super Administrador",
    [EUserRole.ADMIN]: "Administrador",
    [EUserRole.INDEPENDIENTE]: "Usuario Independiente",
    [EUserRole.CLUB_DEPORTIVO]: "Club Deportivo",
    [EUserRole.ENTRENADOR]: "Entrenador",
  };
  return names[role] || "Usuario";
}

export function getRoleHierarchyLevel(role: EUserRole): number {
  // Menor número = mayor jerarquía
  return role;
}

export function canRoleModify(
  currentRole: EUserRole,
  targetRole: EUserRole
): boolean {
  return getRoleHierarchyLevel(currentRole) < getRoleHierarchyLevel(targetRole);
}

export function getAvailableRolesForUser(currentRole: EUserRole): EUserRole[] {
  switch (currentRole) {
    case EUserRole.SUPER_ADMIN:
      return [
        EUserRole.ADMIN,
        EUserRole.INDEPENDIENTE,
        EUserRole.CLUB_DEPORTIVO,
        EUserRole.ENTRENADOR,
      ];
    case EUserRole.ADMIN:
      return [
        EUserRole.INDEPENDIENTE,
        EUserRole.CLUB_DEPORTIVO,
        EUserRole.ENTRENADOR,
      ];
    case EUserRole.INDEPENDIENTE:
      return [EUserRole.INDEPENDIENTE];
    case EUserRole.CLUB_DEPORTIVO:
      return [EUserRole.CLUB_DEPORTIVO];
    case EUserRole.ENTRENADOR:
      return [EUserRole.ENTRENADOR];
    default:
      return [];
  }
}

import { z } from 'zod';

// Common validation schemas
export const IdSchema = z.number().int().positive();

export const PaginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
});

export const SearchSchema = z.object({
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const DateSchema = z.string().datetime().or(z.date());

export const QueryParamsSchema = PaginationSchema.merge(SearchSchema);

// Validation utilities
export class ValidationError extends Error {
    constructor(
        message: string,
        public field: string,
        public code: string = 'VALIDATION_ERROR'
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
    const result = schema.safeParse(data);

    if (!result.success) {
        const firstError = result.error.errors[0];
        throw new ValidationError(
            firstError.message,
            firstError.path.join('.'),
            firstError.code
        );
    }

    return result.data;
};

export const createFormDataValidator = <T>(schema: z.ZodSchema<T>) => {
    return (formData: FormData): T => {
        const data: Record<string, any> = {};

        for (const [key, value] of formData.entries()) {
            // Handle arrays (multiple values with same key)
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        return validateSchema(schema, data);
    };
};

export function useTraceUpdate(props: Record<string, any>) {
  const prev = useRef(props);

  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [key, value]) => {
      if (prev.current[key] !== value) {
        ps[key] = [prev.current[key], value];
      }
      return ps;
    }, {} as Record<string, any>);

    if (Object.keys(changedProps).length > 0) {
      console.log("Changed props/state causing re-render:", changedProps);
    }

    prev.current = props;
  });
}

//Mdo de uso useTraceUpdate

// const [count, setCount] = useState(0);
// useTraceUpdate({ count, setCount });

// De esta manera, le pasamos cualquier cantidad de dependencias que puedan estar ejecutando re-renders innecesarios, y el hook se encargará de imprimir en consola los cambios que se produzcan en cada renderizado.