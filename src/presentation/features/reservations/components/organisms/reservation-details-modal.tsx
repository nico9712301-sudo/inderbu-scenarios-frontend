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
  Calendar,
  CalendarCheck,
  CalendarClock,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Repeat,
  User,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { ReservationDto } from "@/services/reservation.service";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { format, parseISO } from "date-fns";
import { getStatusBadgeClass } from "@/shared/utils/utils";

/* ------------------------------------------------------------------
   🔧  Utilidades de formato y helpers visuales
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
   🪟  ReservationDetailsModal
-------------------------------------------------------------------*/

interface ReservationDetailsModalProps {
  reservation: ReservationDto | null;
  onClose: () => void;
}

export const ReservationDetailsModal = ({
  reservation,
  onClose,
}: ReservationDetailsModalProps) => {
  const [open, setOpen] = useState(false);

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
        <DialogFooter className="pt-2">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
