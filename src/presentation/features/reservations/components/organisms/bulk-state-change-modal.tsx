"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Loader2, AlertTriangle, Settings, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useReservationStates } from "@/presentation/features/reservations/hooks/use-reservation-state.hook";
import { cn } from "@/shared/utils/utils";
import { updateMultipleReservationStatesAction } from "@/infrastructure/web/controllers/update-reservation.action";

interface BulkStateChangeModalProps {
  open: boolean;
  selectedReservationIds: Set<number>;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkStateChangeModal = ({
  open,
  selectedReservationIds,
  onClose,
  onSuccess,
}: BulkStateChangeModalProps) => {
  const { states, loading } = useReservationStates();
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Convert Set to Array for easier handling
  const selectedIds = Array.from(selectedReservationIds);

  // State catalog for display
  const stateCatalog: Record<string, { label: string; tw: string; dotTw: string }> = {
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

  const handleStateSelect = (stateId: number) => {
    setSelectedState(stateId);
  };

  const handleConfirm = () => {
    if (!selectedState) return;
    setShowConfirmDialog(true);
  };

  const handleExecuteBulkUpdate = async () => {
    if (!selectedState || selectedIds.length === 0) return;

    try {
      setIsUpdating(true);

      // Use the first ID as primary and rest as additional
      const [primaryId, ...additionalIds] = selectedIds;

      const result = await updateMultipleReservationStatesAction(
        primaryId,
        additionalIds,
        selectedState
      );

      if (result.success) {
        toast.success(`Reservas actualizadas`, {
          description: `${result.updatedCount} reservas han sido actualizadas exitosamente.`,
        });

        // Close both modals and notify success
        setShowConfirmDialog(false);
        onClose();
        onSuccess();
      } else {
        toast.error("Error al actualizar reservas", {
          description: result.error || "No se pudieron actualizar las reservas. Intenta de nuevo.",
        });
      }
    } catch (err) {
      console.error('Bulk update exception:', err);
      toast.error("Error al actualizar reservas", {
        description: err instanceof Error ? err.message : "No se pudieron actualizar las reservas. Intenta de nuevo.",
      });
    } finally {
      setIsUpdating(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
  };

  const selectedStateInfo = selectedState
    ? states.find(s => s.id === selectedState)
    : null;

  const selectedStateKey = selectedStateInfo
    ? (selectedStateInfo as any).name || (selectedStateInfo as any).state
    : null;

  const selectedStateCatalog = selectedStateKey
    ? stateCatalog[selectedStateKey] || { label: selectedStateKey, tw: "bg-gray-100", dotTw: "bg-gray-500" }
    : null;

  return (
    <>
      {/* Main Selection Modal */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Actualizar Estado de Múltiples Reservas
            </DialogTitle>
            <DialogDescription>
              Selecciona el nuevo estado para {selectedIds.length} reserva(s) seleccionada(s).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Selected reservations count */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
              <Settings className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {selectedIds.length} reserva(s) seleccionada(s)
              </span>
              <Badge variant="outline" className="ml-auto">
                {selectedIds.length}
              </Badge>
            </div>

            {/* State selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Seleccionar nuevo estado:</h3>

              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-sm text-muted-foreground">Cargando estados...</span>
                </div>
              ) : (
                <div className="grid gap-2">
                  {states.map((state) => {
                    const key = (state as any).name ?? (state as any).state;
                    const cat = stateCatalog[key] ?? {
                      label: key,
                      tw: "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300",
                      dotTw: "bg-gray-500",
                    };

                    const isSelected = selectedState === state.id;

                    return (
                      <button
                        key={state.id}
                        onClick={() => handleStateSelect(state.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-md border-2 transition-all text-left",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                        <span
                          className={cn("h-3 w-3 rounded-full flex-shrink-0", cat.dotTw)}
                        />
                        <span className={cn(
                          "font-medium flex-1",
                          isSelected ? "text-primary" : "text-gray-700"
                        )}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedState || isUpdating || loading}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-[500px] p-6">
          <AlertDialogHeader className="pb-2">
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirmar actualización múltiple
            </AlertDialogTitle>
          </AlertDialogHeader>

          {selectedStateCatalog && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-md border">
                <div className="mb-2">
                  ¿Estás seguro de que deseas cambiar el estado de{" "}
                  <span className="font-medium text-primary">{selectedIds.length} reserva(s)</span>
                  {" a "}
                  <span
                    className={cn(
                      "font-semibold px-1.5 py-0.5 rounded-md text-sm",
                      selectedStateKey === "CONFIRMADA" && "bg-green-100 text-green-800",
                      selectedStateKey === "CANCELADA" && "bg-red-100 text-red-800",
                      selectedStateKey === "PENDIENTE" && "bg-yellow-100 text-yellow-800",
                      selectedStateKey === "RECHAZADA" && "bg-gray-100 text-gray-800"
                    )}
                  >
                    {selectedStateCatalog.label.toLowerCase()}
                  </span>
                  ?
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-md border">
                <div className="flex items-center gap-1.5 text-yellow-600 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Importante</span>
                </div>
                <div className="text-slate-700 text-sm">
                  Esta acción afectará múltiples reservas y puede impactar la disponibilidad
                  de los escenarios y las notificaciones enviadas a los usuarios.
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter className="gap-2 mt-2">
            <AlertDialogCancel
              onClick={handleCancelConfirm}
              className="w-full h-9 font-normal text-sm"
              disabled={isUpdating}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecuteBulkUpdate}
              disabled={isUpdating}
              className={cn(
                "text-white w-full h-9 text-sm font-medium",
                selectedStateKey === "CONFIRMADA" && "bg-green-600 hover:bg-green-700",
                selectedStateKey === "CANCELADA" && "bg-red-600 hover:bg-red-700",
                selectedStateKey === "PENDIENTE" && "bg-yellow-600 hover:bg-yellow-700",
                selectedStateKey === "RECHAZADA" && "bg-gray-600 hover:bg-gray-700"
              )}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  Confirmar actualización
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};