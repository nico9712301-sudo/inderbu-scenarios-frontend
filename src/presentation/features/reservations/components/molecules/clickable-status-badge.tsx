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
import { ConfirmPaidReservationModal } from "@/presentation/features/dashboard/billing/components/organisms/confirm-paid-reservation-modal";
import { confirmReservationAction } from "@/infrastructure/web/controllers/dashboard/confirm-reservation.actions";

interface ClickableStatusBadgeProps {
  /** id actual de la reserva – viene del backend */
  statusId: number;
  reservationId?: number;
  /** Datos completos de la reserva para mostrar en confirmación */
  reservationInfo?: {
    userEmail?: string;
    date?: string;
  };
  /** Reserva completa para verificar hasCost y hasPaymentProofs */
  reservation?: {
    hasCost?: boolean;
    hasPaymentProofs?: boolean;
    subScenario?: {
      hasCost?: boolean;
    };
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
  reservation,
  onStatusChange,
}: ClickableStatusBadgeProps) {
  const { states, loading } = useReservationStates();
  const [isUpdating, setIsUpdating] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmPaidDialogOpen, setConfirmPaidDialogOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<number | null>(null);
  
  // Check if reservation has cost
  const hasCost = reservation?.hasCost ?? reservation?.subScenario?.hasCost ?? false;

  // Función para validar transiciones de estado permitidas
  const isStatusTransitionAllowed = (currentStatusId: number, targetStatusId: number): boolean => {
    // Solo se permite cambiar de PENDIENTE (1) a CONFIRMADA (2) o CANCELADA (3)
    // Estados finales (CONFIRMADA y CANCELADA) no pueden cambiar
    if (currentStatusId === 1) { // PENDIENTE
      return targetStatusId === 2 || targetStatusId === 3; // CONFIRMADA o CANCELADA
    }

    // Estados finales no pueden cambiar
    return false;
  };

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
  const showConfirmDialog = async (newStateId: number) => {
    if (newStateId === statusId) {
      setOpen(false);
      return;
    }

    // If confirming a paid reservation (CONFIRMADA = 2), check for payment proofs
    if (newStateId === 2 && hasCost && reservationId) {
      try {
        const { getPaymentProofsByReservationAction } = await import("@/infrastructure/web/controllers/dashboard/payment-proof.actions");
        const result = await getPaymentProofsByReservationAction(reservationId);
        if (result.success && result.data.length > 0) {
          // Has payment proofs, confirm directly
          setSelectedState(newStateId);
          setConfirmDialogOpen(true);
        } else {
          // No payment proofs, show special modal
          setSelectedState(newStateId);
          setConfirmPaidDialogOpen(true);
        }
      } catch (error) {
        console.error("Error checking payment proofs:", error);
        // On error, show special modal to be safe
        setSelectedState(newStateId);
        setConfirmPaidDialogOpen(true);
      }
    } else {
      // Normal confirmation flow
      setSelectedState(newStateId);
      setConfirmDialogOpen(true);
    }
    
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

  /** 7. Acción al confirmar reserva de pago (con comprobante o justificación) */
  const handleConfirmPaidReservation = async (data: { justification?: string; paymentProofFile?: File }) => {
    if (selectedState === null || !reservationId) return;

    try {
      setIsUpdating(true);
      
      // Use special confirm endpoint for paid reservations
      const result = await confirmReservationAction(reservationId, data);

      if (result.success) {
        toast.success("Reserva confirmada exitosamente", {
          description: `La reserva #${reservationId} ha sido confirmada.`,
        });

        onStatusChange?.(selectedState);
      } else {
        toast.error("Error al confirmar reserva", {
          description: result.error || "No se pudo confirmar la reserva. Intenta de nuevo.",
        });
      }
    } catch (err) {
      console.error('Confirm paid reservation exception:', err);
      toast.error("Error al confirmar reserva", {
        description: err instanceof Error ? err.message : "No se pudo confirmar la reserva. Intenta de nuevo.",
      });
    } finally {
      setIsUpdating(false);
      setConfirmPaidDialogOpen(false);
      setSelectedState(null);
    }
  };

  const handleCancelStatusChange = () => {
    setConfirmDialogOpen(false);
    setSelectedState(null);
  };

  // Verificar si el estado actual permite cambios
  const canChangeStatus = statusId === 1; // Solo PENDIENTE puede cambiar

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          disabled={loading || isUpdating || !reservationId || !canChangeStatus}
          asChild
        >
          <Badge
            className={cn(
              "text-xs px-2 py-0.5 border",
              canChangeStatus ? "cursor-pointer" : "cursor-default opacity-75",
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

              const isCurrentState = state.id === statusId;
              const isTransitionAllowed = isStatusTransitionAllowed(statusId, state.id);
              const isDisabled = !isTransitionAllowed && !isCurrentState;

              return (
                <DropdownMenuItem
                  key={state.id}
                  onClick={() => !isDisabled && showConfirmDialog(state.id)}
                  className={cn(
                    "text-xs flex items-center",
                    isCurrentState && "font-medium",
                    isDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                >
                  {isCurrentState && <Check className="h-3 w-3 mr-1" />}
                  <span
                    className={cn("h-2 w-2 rounded-full mr-2", cat.dotTw)}
                  />
                  {cat.label}
                  {isDisabled && !isCurrentState && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      No disponible
                    </span>
                  )}
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

      {/* Modal de confirmación para reservas de pago sin comprobante */}
      {reservationId && (
        <ConfirmPaidReservationModal
          open={confirmPaidDialogOpen}
          onClose={() => {
            setConfirmPaidDialogOpen(false);
            setSelectedState(null);
          }}
          reservation={reservation ? {
            id: reservationId,
            hasCost,
            hasPaymentProofs: reservation.hasPaymentProofs,
            subScenario: reservation.subScenario,
          } as any : null}
          onConfirm={handleConfirmPaidReservation}
        />
      )}
    </>
  );
}
