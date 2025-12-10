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

      // Show processing toast for large operations
      if (selectedIds.length > 5) {
        toast.info("Procesando operación masiva", {
          description: `Actualizando ${selectedIds.length} reservas. Esto puede tomar hasta 60 segundos.`,
        });
      }

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

      // Enhanced error messaging for timeout scenarios
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      const isTimeoutError = errorMessage.includes("timeout") || errorMessage.includes("aborted");

      toast.error("Error al actualizar reservas", {
        description: isTimeoutError
          ? "La operación tardó más de lo esperado. Verifica el estado de las reservas y reintenta si es necesario."
          : errorMessage,
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

  // Helper function para determinar si es confirmación o cancelación
  const getActionType = () => {
    if (!selectedState) return 'actualizar';

    // Método directo: buscar por ID
    if (selectedState === 2) return 'confirmar'; // ID 2 = CONFIRMADA
    if (selectedState === 3) return 'cancelar';  // ID 3 = CANCELADA

    // Fallback usando el selectedStateKey
    if (selectedStateKey === "CONFIRMADA") return 'confirmar';
    if (selectedStateKey === "CANCELADA") return 'cancelar';

    return 'actualizar';
  };

  // Debug log para verificar el estado seleccionado
  console.log('Debug - selectedState:', selectedState);
  console.log('Debug - selectedStateInfo:', selectedStateInfo);
  console.log('Debug - selectedStateKey:', selectedStateKey);
  console.log('Debug - getActionType():', getActionType());
  console.log('Debug - isUpdating:', isUpdating);

  return (
    <>
      {/* Main Selection Modal */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Confirmar o Cancelar Múltiples Reservas
            </DialogTitle>
            <DialogDescription>
              Confirma o cancela {selectedIds.length} reserva(s) pendiente(s) seleccionada(s).
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
              <h3 className="text-sm font-medium">¿Qué acción deseas realizar?</h3>

              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-sm text-muted-foreground">Cargando estados...</span>
                </div>
              ) : (
                <div className="grid gap-2">
                  {states
                    .filter((state) => {
                      // Solo mostrar CONFIRMADA y CANCELADA para operaciones bulk
                      const key = (state as any).name ?? (state as any).state;
                      return key === 'CONFIRMADA' || key === 'CANCELADA';
                    })
                    .map((state) => {
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
              {(() => {
                if (!selectedState) return "Continuar";

                const actionType = getActionType();
                if (actionType === 'confirmar') {
                  return `Confirmar ${selectedIds.length} reserva${selectedIds.length > 1 ? 's' : ''}`;
                } else if (actionType === 'cancelar') {
                  return `Cancelar ${selectedIds.length} reserva${selectedIds.length > 1 ? 's' : ''}`;
                } else {
                  return "Continuar";
                }
              })()}
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
              {selectedStateKey === "CONFIRMADA" ? "Confirmar reservas múltiples" : "Cancelar reservas múltiples"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          {selectedStateCatalog && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-md border">
                <div className="mb-2">
                  {selectedStateKey === "CONFIRMADA"
                    ? <>¿Estás seguro de que deseas <strong>confirmar</strong> {" "}
                       <span className="font-medium text-primary">{selectedIds.length} reserva(s)</span>
                       {" "}pendiente(s)?</>
                    : <>¿Estás seguro de que deseas <strong>cancelar</strong> {" "}
                       <span className="font-medium text-primary">{selectedIds.length} reserva(s)</span>
                       {" "}pendiente(s)?</>
                  }
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-md border">
                <div className="flex items-center gap-1.5 text-yellow-600 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Importante</span>
                </div>
                <div className="text-slate-700 text-sm">
                  {selectedStateKey === "CONFIRMADA"
                    ? "Esta acción confirmará múltiples reservas y enviará emails de confirmación a los usuarios. Los escenarios quedarán ocupados en las fechas y horarios especificados."
                    : "Esta acción cancelará múltiples reservas y enviará emails de cancelación a los usuarios. Los escenarios quedarán disponibles nuevamente."
                  }
                </div>
                {selectedIds.length > 5 && (
                  <div className="mt-2 text-xs text-amber-600">
                    💡 Operaciones con más de 5 reservas pueden tomar hasta 60 segundos
                  </div>
                )}
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
                  {(() => {
                    const actionType = getActionType();
                    let actionText;

                    if (actionType === 'confirmar') {
                      actionText = "Confirmando";
                    } else if (actionType === 'cancelar') {
                      actionText = "Cancelando";
                    } else {
                      actionText = "Actualizando";
                    }

                    if (selectedIds.length > 5) {
                      return `${actionText} ${selectedIds.length} reservas...`;
                    } else {
                      return `${actionText} reservas...`;
                    }
                  })()}
                </>
              ) : (
                <>
                  {(() => {
                    const actionType = getActionType();
                    if (actionType === 'confirmar') {
                      return "Confirmar reservas";
                    } else if (actionType === 'cancelar') {
                      return "Cancelar reservas";
                    } else {
                      return "Actualizar reservas";
                    }
                  })()}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};