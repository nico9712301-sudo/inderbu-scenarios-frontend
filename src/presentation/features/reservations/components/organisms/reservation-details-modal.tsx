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
import {
  AlertTriangle,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Check,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Repeat,
  User,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { ReservationDto } from "@/entities/reservation/model/types";
import { ClickableStatusBadge } from "../molecules/clickable-status-badge";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { format, parseISO } from "date-fns";
import { getStatusBadgeClass, cn } from "@/shared/utils/utils";
import { useState as useLocalState } from "react";
import { toast } from "sonner";
import { UpdateReservationResult, updateReservationStateAction } from "@/infrastructure/web/controllers/update-reservation.action";

/* ------------------------------------------------------------------
    Utilidades de formato y helpers visuales
-------------------------------------------------------------------*/

const weekdayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const fmtDate = (d: string) => format(parseISO(d), "dd/MM/yyyy");
const fmtTime = (t: string) => format(parseISO(`1970-01-01T${t}`), "HH:mm");

const ReservationTypeIndicator = ({ type }: { type: string }) =>
  type === "SINGLE" ? (
    <Badge
      variant="outline"
      className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
    >
      <Calendar className="w-3 h-3" /> Única
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1"
    >
      <Repeat className="w-3 h-3" /> Recurrente
    </Badge>
  );

const WeekDaysDisplay = ({ weekDays }: { weekDays: number[] | null }) =>
  !weekDays || weekDays.length === 0 ? null : (
    <div className="flex flex-wrap gap-1">
      {weekDays.map((d) => (
        <Badge key={d} variant="secondary" className="text-xs px-1 py-0">
          {weekdayNames[d]}
        </Badge>
      ))}
    </div>
  );

const TimeSlotDisplay = ({ reservation }: { reservation: ReservationDto }) => {
  const { type, timeSlot, timeslots } = reservation;

  if (type === "SINGLE" && timeSlot) {
    return (
      <span>
        {fmtTime(timeSlot.startTime)} – {fmtTime(timeSlot.endTime)}
      </span>
    );
  }

  if (type === "RANGE" && timeslots?.length) {
    return (
      <span>
        {timeslots
          .map(
            (s) => `${fmtTime(s.startTime)}–${fmtTime(s.endTime)}`
          )
          .join(", ")}
      </span>
    );
  }

  return <span className="text-xs text-muted-foreground">Sin horario</span>;
};

/* ------------------------------------------------------------------
   ReservationDetailsModal
-------------------------------------------------------------------*/

interface ReservationDetailsModalProps {
  reservation: ReservationDto | null;
  onClose: () => void;
  onStatusChange?: () => void; // Callback para refrescar datos tras cambio de estado
}

export const ReservationDetailsModal = ({
  reservation,
  onClose,
  onStatusChange,
}: ReservationDetailsModalProps) => {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useLocalState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ statusId: number; actionLabel: string } | null>(null);

  /* Sincronizar apertura con prop */
  useEffect(() => {
    setOpen(!!reservation);
  }, [reservation]);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      setOpen(v);
      if (!v) onClose();
    },
    [onClose]
  );

  const showConfirmationDialog = (newStatusId: number, actionLabel: string) => {
    if (!reservation) return;

    const currentStatusId = reservation.reservationState?.id ?? reservation.reservationStateId ?? 1;

    // Validar que la transición sea permitida antes de mostrar el modal
    if (!isStatusTransitionAllowed(currentStatusId, newStatusId)) {
      toast.error("Transición no permitida", {
        description: "No se puede cambiar el estado de una reserva confirmada o cancelada.",
      });
      return;
    }

    setPendingAction({ statusId: newStatusId, actionLabel });
    setConfirmDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!reservation?.id || !pendingAction) return;

    const currentStatusId = reservation.reservationState?.id ?? reservation.reservationStateId ?? 1;

    // Validación final antes de ejecutar la acción
    if (!isStatusTransitionAllowed(currentStatusId, pendingAction.statusId)) {
      toast.error("Transición no permitida", {
        description: "No se puede cambiar el estado de una reserva confirmada o cancelada.",
      });
      setConfirmDialogOpen(false);
      setPendingAction(null);
      return;
    }

    try {
      setIsUpdating(true);

      const result: UpdateReservationResult = await updateReservationStateAction(
        reservation.id,
        { reservationStateId: pendingAction.statusId }
      );

      if (result.success) {
        toast.success(`Reserva ${pendingAction.actionLabel.toLowerCase()}`, {
          description: `La reserva #${reservation.id} ha sido ${pendingAction.actionLabel.toLowerCase()} correctamente.`,
        });

        // Callback para refrescar datos
        onStatusChange?.();

        // Cerrar ambos modales
        setConfirmDialogOpen(false);
        onClose();
      } else {
        toast.error(`Error al ${pendingAction.actionLabel.toLowerCase()} reserva`, {
          description: result.error || `No se pudo ${pendingAction.actionLabel.toLowerCase()} la reserva. Intenta de nuevo.`,
        });
      }
    } catch (err) {
      console.error('Update reservation state exception:', err);
      toast.error(`Error al ${pendingAction.actionLabel.toLowerCase()} reserva`, {
        description: err instanceof Error ? err.message : `No se pudo ${pendingAction.actionLabel.toLowerCase()} la reserva. Intenta de nuevo.`,
      });
    } finally {
      setIsUpdating(false);
      setConfirmDialogOpen(false);
      setPendingAction(null);
    }
  };

  const handleCancelStatusChange = () => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

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

  // Componente para renderizar acciones según el estado
  const ReservationActions = ({ reservation }: { reservation: ReservationDto }) => {
    const currentStatusId = reservation.reservationState?.id ?? reservation.reservationStateId ?? 1;
    const currentStatusName = reservation.reservationState?.state ?? "PENDIENTE";

    // Estados: 1=PENDIENTE, 2=CONFIRMADA, 3=RECHAZADA/CANCELADA
    switch (currentStatusId) {
      case 1: // PENDIENTE - Solo estado que permite cambios
        return (
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              onClick={() => showConfirmationDialog(2, "confirmada")}
              disabled={isUpdating || !isStatusTransitionAllowed(currentStatusId, 2)}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Confirmar Reserva
            </Button>
            <Button
              onClick={() => showConfirmationDialog(3, "cancelada")}
              disabled={isUpdating || !isStatusTransitionAllowed(currentStatusId, 3)}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Cancelar Reserva
            </Button>
          </div>
        );

      case 2: // CONFIRMADA - Estado final, solo lectura
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1 px-3 py-1">
              <Check className="h-3 w-3" />
              Reserva Confirmada
            </Badge>
            <div className="text-xs text-muted-foreground">
              Estado final - No se puede modificar
            </div>
          </div>
        );

      case 3: // CANCELADA/RECHAZADA - Estado final, solo lectura
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1 px-3 py-1">
              <X className="h-3 w-3" />
              Reserva Cancelada
            </Badge>
            <div className="text-xs text-muted-foreground">
              Estado final - No se puede modificar
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              Estado: {currentStatusName}
            </Badge>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* ---------- Encabezado ---------- */}
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Detalles de Reserva
          </DialogTitle>
          {reservation && (
            <Badge
              variant="outline"
              className={getStatusBadgeClass(
                reservation.reservationState?.state
              )}
            >
              {reservation.reservationState?.state?.toLowerCase()}
            </Badge>
          )}
        </DialogHeader>

        {/* ---------- Cuerpo ---------- */}
        {reservation && (
          <div className="p-2 space-y-6 overflow-y-auto">
            {/* Cliente */}
            <section className="bg-slate-50 p-4 rounded-lg border">
              <header className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Información del Cliente</h3>
              </header>
              <div className="space-y-2 text-sm">
                <p>
                  <Label className="text-xs text-muted-foreground">Nombre</Label>{" "}
                  {reservation.user
                    ? `${reservation.user.firstName} ${reservation.user.lastName}`
                    : "Cliente sin nombre"}
                </p>
                <p>
                  <Label className="text-xs text-muted-foreground">Email</Label>{" "}
                  {reservation.user?.email || "Sin email"}
                </p>
                {reservation.user?.phone && (
                  <p>
                    <Label className="text-xs text-muted-foreground">
                      Teléfono
                    </Label>{" "}
                    {reservation.user.phone}
                  </p>
                )}
              </div>
            </section>

            {/* Escenario */}
            <section className="bg-slate-50 p-4 rounded-lg border">
              <header className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Información del Escenario</h3>
              </header>
              <div className="space-y-2 text-sm">
                <p>
                  <Label className="text-xs text-muted-foreground">
                    Sub-escenario
                  </Label>{" "}
                  {reservation.subScenario?.name || "Sin nombre"}
                </p>
                <p>
                  <Label className="text-xs text-muted-foreground">
                    Escenario
                  </Label>{" "}
                  {reservation.subScenario?.scenarioName || "Sin escenario"}
                </p>
                <div>
                  <Label className="text-xs text-muted-foreground">Costo</Label>{" "}
                  {reservation.subScenario?.hasCost ? (
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1"
                    >
                      <CreditCard className="h-3 w-3 mr-1" /> De pago
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Gratuito
                    </Badge>
                  )}
                </div>
              </div>
            </section>

            {/* Fecha y Hora */}
            <section className="bg-slate-50 p-4 rounded-lg border">
              <header className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Fecha y Hora</h3>
              </header>
              <div className="space-y-2 text-sm">
                {/* Fechas principales */}
                <div className="flex items-center gap-1">
                  <CalendarCheck className="h-4 w-4 text-gray-500" />
                  {reservation.type === "SINGLE"
                    ? fmtDate(reservation.initialDate)
                    : `${fmtDate(reservation.initialDate)} → ${fmtDate(
                        reservation.finalDate!
                      )}`}
                  <ReservationTypeIndicator type={reservation.type} />
                </div>

                {/* Datos extra para RANGE */}
                {reservation.type === "RANGE" && (
                  <>
                    {reservation.totalInstances && (
                      <Badge variant="outline" className="text-xs">
                        {reservation.totalInstances} sesiones
                      </Badge>
                    )}
                    <WeekDaysDisplay weekDays={reservation.weekDays} />
                  </>
                )}

                {/* Horarios */}
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <TimeSlotDisplay reservation={reservation} />
                </div>

                {/* Creación */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  Creada: {fmtDate(reservation.createdAt)}
                </div>
              </div>
            </section>

            {/* Comentarios */}
            {reservation.comments && (
              <section className="bg-slate-50 p-4 rounded-lg border">
                <header className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Comentarios</h3>
                </header>
                <p className="text-sm whitespace-pre-wrap">
                  {reservation.comments}
                </p>
              </section>
            )}
          </div>
        )}

        {/* ---------- Pie ---------- */}
        <DialogFooter className="pt-4 flex flex-col gap-3">
          {/* Botones de acción según estado */}
          {reservation && <ReservationActions reservation={reservation} />}

          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
              Cerrar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Modal de confirmación */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="max-w-[500px] p-6">
          <AlertDialogHeader className="pb-2">
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirmar cambio de estado
            </AlertDialogTitle>
          </AlertDialogHeader>

          {pendingAction && reservation && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-md border">
                <div className="mb-2">
                  ¿Estás seguro de que deseas{" "}
                  <span className="font-medium">{pendingAction.actionLabel.toLowerCase()}</span>{" "}
                  la reserva de{" "}
                  <span className="text-primary font-medium">
                    {reservation.user?.email || "usuario"}
                  </span>{" "}
                  del{" "}
                  <span className="text-primary font-medium">
                    {fmtDate(reservation.initialDate)}
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
                pendingAction?.actionLabel === "confirmada" &&
                  "bg-green-600 hover:bg-green-700",
                pendingAction?.actionLabel === "cancelada" &&
                  "bg-red-600 hover:bg-red-700"
              )}
            >
              {pendingAction?.actionLabel === "confirmada" ? "Confirmar Reserva" : "Cancelar Reserva"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
