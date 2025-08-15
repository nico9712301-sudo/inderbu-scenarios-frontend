"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ReservationStateDto } from "@/entities/reservation/model/types";
import { useReservationStates } from "../../hooks/use-reservation-state.hook";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { useMemo, useState } from "react";
import { cn } from "@/shared/utils/utils";
import { toast } from "sonner";
import { UpdateReservationResult, updateReservationStateAction } from "@/infrastructure/web/controllers/update-reservation.action";

interface ClickableStatusBadgeProps {
  /** id actual de la reserva – viene del backend */
  statusId: number;
  reservationId?: number;
  /** Datos completos de la reserva para mostrar en confirmación */
  reservationInfo?: {
    userEmail?: string;
    date?: string;
  };
  /** callback opcional si el padre quiere reaccionar */
  onStatusChange?: (newStatusId: number) => void;
}

/** 1. Catálogo name → (label, classes, dot-color) */
const stateCatalog: Record<
  string,
  { label: string; tw: string; dotTw: string }
> = {
  PENDIENTE: {
    label: "Pendiente",
    tw: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300",
    dotTw: "bg-yellow-500",
  },
  CONFIRMADA: {
    label: "Confirmada",
    tw: "bg-green-100 hover:bg-green-200 text-green-800 border-green-300",
    dotTw: "bg-green-500",
  },
  CANCELADA: {
    label: "Cancelada",
    tw: "bg-red-100 hover:bg-red-200 text-red-800 border-red-300",
    dotTw: "bg-red-500",
  },
  RECHAZADA: {
    label: "Rechazada",
    tw: "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300",
    dotTw: "bg-gray-500",
  },
};

export function ClickableStatusBadge({
  statusId,
  reservationId,
  reservationInfo,
  onStatusChange,
}: ClickableStatusBadgeProps) {
  const { states, loading } = useReservationStates();
  const [isUpdating, setIsUpdating] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<number | null>(null);

  /** 2. Estado actual (puede ser undefined mientras carga) */
  const currentState: ReservationStateDto | undefined = states.find(
    (s) => s.id === statusId
  );
  
  /** 3. Determinar clave del catálogo */
  const keyCurrent = (currentState as any)?.name ?? (currentState as any)?.state ?? "PENDIENTE";

  // Información del estado seleccionado para el diálogo de confirmación
  const selectedStateInfo = useMemo(() => {
    if (selectedState === null) return null;
    const state = states.find((s) => s.id === selectedState);
    if (!state) return null;

    const key = (state as any).name ?? (state as any).state;
    return {
      id: state.id,
      key,
      label: stateCatalog[key]?.label ?? key,
    };
  }, [selectedState, states]);

  /** 4. Catálogo para el badge actual */
  const currentCatalog = useMemo(
    () =>
      stateCatalog[keyCurrent] ?? {
        label: keyCurrent,
        tw: "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300",
        dotTw: "bg-gray-500",
      },
    [keyCurrent]
  );

  /** 5. Mostrar diálogo de confirmación */
  const showConfirmDialog = (newStateId: number) => {
    if (newStateId === statusId) {
      setOpen(false);
      return;
    }

    setSelectedState(newStateId);
    setConfirmDialogOpen(true);
    setOpen(false); // Cerrar el dropdown
  };

  /** 6. Acción al confirmar cambio de estado */
  const handleConfirmStatusChange = async () => {
    if (selectedState === null || !reservationId) return;

    try {
      setIsUpdating(true);
      
      // Use DDD server action instead of legacy service
      const result: UpdateReservationResult = await updateReservationStateAction(
        reservationId,
        { reservationStateId: selectedState }
      );

      if (result.success) {
        const state = states.find((s) => s.id === selectedState);
        const key = (state as any)?.name ?? (state as any)?.state ?? "";
        const label = stateCatalog[key]?.label ?? key;

        toast.success(`Estado cambiado a ${label}`, {
          description: `La reserva #${reservationId} ahora está ${label.toLowerCase()}.`,
        });

        onStatusChange?.(selectedState);
      } else {
        toast.error("Error al cambiar el estado", {
          description: result.error || "No se pudo actualizar el estado de la reserva. Intenta de nuevo.",
        });
      }
    } catch (err) {
      console.error('Update reservation state exception:', err);
      toast.error("Error al cambiar el estado", {
        description: err instanceof Error ? err.message : "No se pudo actualizar el estado de la reserva. Intenta de nuevo.",
      });
    } finally {
      setIsUpdating(false);
      setConfirmDialogOpen(false);
      setSelectedState(null);
    }
  };

  const handleCancelStatusChange = () => {
    setConfirmDialogOpen(false);
    setSelectedState(null);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          disabled={loading || isUpdating || !reservationId}
          asChild
        >
          <Badge
            className={cn(
              "text-xs px-2 py-0.5 cursor-pointer border",
              currentCatalog.tw
            )}
          >
            {isUpdating ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Actualizando…
              </span>
            ) : (
              currentCatalog.label
            )}
          </Badge>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          {loading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="text-xs">Cargando…</span>
            </div>
          ) : (
            states.map((state: ReservationStateDto) => {
              // El backend devuelve { id, name }, pero admitimos también state
              const key = (state as any).name ?? (state as any).state;
              const cat = stateCatalog[key] ?? {
                label: key,
                tw: "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300",
                dotTw: "bg-gray-500",
              };

              return (
                <DropdownMenuItem
                  key={state.id}
                  onClick={() => showConfirmDialog(state.id)}
                  className={cn(
                    "text-xs flex items-center",
                    state.id === statusId && "font-medium"
                  )}
                >
                  {state.id === statusId && <Check className="h-3 w-3 mr-1" />}
                  <span
                    className={cn("h-2 w-2 rounded-full mr-2", cat.dotTw)}
                  />
                  {cat.label}
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo de confirmación */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="max-w-[500px] p-6">
          <AlertDialogHeader className="pb-2">
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirmar cambio de estado
            </AlertDialogTitle>
          </AlertDialogHeader>

          {selectedStateInfo && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-md border">
                <div className="mb-2">
                  ¿Estás seguro de que deseas cambiar el estado de la reserva
                  {reservationInfo ? (
                    <span className="font-medium">
                      {" "}
                      de{" "}
                      <span className="text-primary">
                        {reservationInfo.userEmail || "usuario"}
                      </span>{" "}
                      del{" "}
                      <span className="text-primary">
                        {reservationInfo.date || "fecha programada"}
                      </span>
                    </span>
                  ) : (
                    <span className="font-medium"> #{reservationId}</span>
                  )}
                  {" a "}
                  <span
                    className={cn(
                      "font-semibold px-1.5 py-0.5 rounded-md text-sm",
                      selectedStateInfo.key === "CONFIRMADA" &&
                        "bg-green-100 text-green-800",
                      selectedStateInfo.key === "CANCELADA" &&
                        "bg-red-100 text-red-800",
                      selectedStateInfo.key === "PENDIENTE" &&
                        "bg-yellow-100 text-yellow-800",
                      selectedStateInfo.key === "RECHAZADA" &&
                        "bg-gray-100 text-gray-800"
                    )}
                  >
                    {selectedStateInfo.label.toLowerCase()}
                  </span>
                  ?
                </div>
              </div>

              <div className="flex gap-2 text-sm">
                <div className="p-3 bg-slate-50 rounded-md border flex-1">
                  <div className="flex items-center gap-1.5 text-yellow-600 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Importante</span>
                  </div>
                  <div className="text-slate-700">
                    Este cambio puede afectar la disponibilidad del escenario y
                    las notificaciones enviadas.
                  </div>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter className="gap-2 mt-2">
            <AlertDialogCancel
              onClick={handleCancelStatusChange}
              className="w-full h-9 font-normal text-sm"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              className={cn(
                "text-white w-full h-9 text-sm font-medium",
                selectedStateInfo?.key === "CONFIRMADA" &&
                  "bg-green-600 hover:bg-green-700",
                selectedStateInfo?.key === "CANCELADA" &&
                  "bg-red-600 hover:bg-red-700",
                selectedStateInfo?.key === "PENDIENTE" &&
                  "bg-yellow-600 hover:bg-yellow-700",
                selectedStateInfo?.key === "RECHAZADA" &&
                  "bg-gray-600 hover:bg-gray-700"
              )}
            >
              Confirmar cambio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
