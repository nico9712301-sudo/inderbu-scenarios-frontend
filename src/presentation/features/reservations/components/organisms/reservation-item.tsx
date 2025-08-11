/* ─────────────────────────────────────────────────────────────────────────────
 * ReservationItem.tsx  ·  Mejorado para SINGLE vs RANGE  ·  2025-06-15
 * ────────────────────────────────────────────────────────────────────────────*/

"use client";

import { ReservationDto } from "@/services/reservation.service";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Settings,
  Tag,
  Users,
  X,
  CalendarDays,
  Repeat,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "../atoms/status-badge";
import {
  cancelReservationAction,
  CancelReservationResult,
} from "../../use-cases/cancel/actions/cancel-reservation.action";

/* ───────────────────────────────────  Props  ─────────────────────────────── */
interface ReservationItemProps {
  reservation: ReservationDto;
  isActive: boolean;
  onCancelled: (id: number) => void;
  onModify?: (reservation: ReservationDto) => void;
  highlightManageButton?: boolean;
}

/* ──────────────────────  Helpers de formateo  ──────────────────────────── */
const formatReservationDate = (reservation: ReservationDto) => {
  try {
    const initialDate = parseISO(reservation.initialDate);
    
    if (reservation.type === "RANGE" && reservation.finalDate) {
      const finalDate = parseISO(reservation.finalDate);
      
      // Para reservas RANGE, mostrar el rango
      const startFormatted = format(initialDate, "dd MMM", { locale: es });
      const endFormatted = format(finalDate, "dd MMM", { locale: es });
      
      return {
        shortDate: `${startFormatted} - ${endFormatted}`,
        fullDate: `${format(initialDate, "EEEE d 'de' MMMM", { locale: es })} hasta ${format(finalDate, "EEEE d 'de' MMMM", { locale: es })}`,
        isRange: true,
        weekDays: reservation.weekDays || []
      };
    } else {
      // Para reservas SINGLE, mostrar fecha única
      return {
        shortDate: format(initialDate, "dd MMM", { locale: es }),
        fullDate: format(initialDate, "EEEE d 'de' MMMM", { locale: es }),
        isRange: false,
        weekDays: []
      };
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    return {
      shortDate: "Fecha inválida",
      fullDate: "Fecha inválida",
      isRange: false,
      weekDays: []
    };
  }
};

const getWeekDayNames = (weekDays: number[]) => {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  return weekDays.map(day => days[day]).join(", ");
};

export function ReservationItem({
  reservation,
  isActive,
  onCancelled,
  onModify,
  highlightManageButton = false,
}: ReservationItemProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const timeSlot = reservation.timeSlot ?? reservation.timeslots?.[0] ?? undefined;
  const dateInfo = formatReservationDate(reservation);

  const handleCancelReservation = async () => {
    setIsCancelling(true);
    try {
      const result: CancelReservationResult = await cancelReservationAction(
        reservation.id,
      );
      if (result.success) {
        toast.success(
          result.message || "La reserva ha sido cancelada exitosamente",
        );
        onCancelled(reservation.id);
      } else {
        toast.error(result.error || "No se pudo cancelar la reserva");
      }
    } catch (err) {
      console.error("Cancel reservation exception:", err);
      toast.error("Ocurrió un error al cancelar la reserva");
    } finally {
      setIsCancelling(false);
      setIsConfirmOpen(false);
    }
  };

  /* ---------- Render ---------- */
  return (
    <>
      <Card
        className={`h-full overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-xl backdrop-blur-sm group relative ${
          !isActive ? "opacity-75" : ""
        }`}
      >
        {/* Badge de tipo de reserva */}
        <div className="absolute top-2 left-2 z-30">
          <Badge
            variant="outline"
            className={`text-xs font-medium ${
              dateInfo.isRange 
                ? "bg-purple-100 text-purple-700 border-purple-200" 
                : "bg-blue-100 text-blue-700 border-blue-200"
            }`}
          >
            {dateInfo.isRange ? (
              <>
                <Repeat className="w-3 h-3 mr-1" />
                RANGO
              </>
            ) : (
              <>
                <CalendarDays className="w-3 h-3 mr-1" />
                ÚNICA
              </>
            )}
          </Badge>
        </div>
        {/* Imagen */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          <Image
            src="https://inderbu.gov.co/escenarios/content/fields/57/12770.jpg"
            alt={reservation.subScenario.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Estado */}
          <div className="absolute top-2 right-2 z-20">
            <div className="backdrop-blur-sm rounded-lg shadow-lg">
              <StatusBadge
                status={reservation.reservationState.state!}
                size="sm"
                variant="default"
              />
            </div>
          </div>

          {/* Fecha breve */}
          <div className="absolute bottom-2 left-2 right-2 z-20">
            <Badge
              variant="outline"
              className={`bg-white/95 text-gray-700 border-white/50 backdrop-blur-sm shadow-sm w-full justify-center ${
                dateInfo.isRange ? "text-purple-700" : "text-blue-700"
              }`}
            >
              <CalendarIcon className="w-3 h-3 mr-1" />
              {dateInfo.shortDate}
            </Badge>
          </div>

          {/* Overlay inferior */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-white group-hover:text-blue-200 transition-colors">
              {reservation.subScenario.name}
            </h3>
            <div className="flex items-center text-white/90 text-sm">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">
                {reservation.subScenario.scenario?.neighborhood?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <CardContent className="p-5">
          {/* Costo / capacidad */}
          <div className="flex items-center justify-between mb-3">
            <Badge
              variant="outline"
              className={`text-xs ${
                reservation.subScenario.hasCost
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {reservation.subScenario.hasCost ? "De pago" : "Gratuito"}
            </Badge>
            {reservation.subScenario.numberOfPlayers && (
              <div className="flex items-center text-gray-500 text-xs">
                <Users className="w-3 h-3 mr-1" />
                <span>{reservation.subScenario.numberOfPlayers} jugadores</span>
              </div>
            )}
          </div>

          {/* Información de fecha diferenciada */}
          <div className="space-y-3 mb-4">
            {/* Fecha principal */}
            <div className="flex items-start text-sm">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                dateInfo.isRange ? "bg-purple-50" : "bg-blue-50"
              }`}>
                {dateInfo.isRange ? (
                  <Repeat className={`w-4 h-4 ${dateInfo.isRange ? "text-purple-600" : "text-blue-600"}`} />
                ) : (
                  <CalendarIcon className={`w-4 h-4 ${dateInfo.isRange ? "text-purple-600" : "text-blue-600"}`} />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 capitalize leading-tight">
                  {dateInfo.fullDate}
                </p>
                {/* Días de la semana para reservas RANGE */}
                {dateInfo.isRange && dateInfo.weekDays.length > 0 && (
                  <p className="text-xs text-purple-600 mt-1">
                    {getWeekDayNames(dateInfo.weekDays)}
                  </p>
                )}
              </div>
            </div>

            {/* Horarios */}
            {timeSlot && (
              <div className="flex items-center text-sm">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {timeSlot.startTime} - {timeSlot.endTime}
                  </p>
                  {/* Múltiples horarios para RANGE */}
                  {reservation.timeslots && reservation.timeslots.length > 1 && (
                    <p className="text-xs text-green-600 mt-1">
                      +{reservation.timeslots.length - 1} horarios más
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Dirección */}
            <div className="flex items-start text-sm">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                <MapPin className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 line-clamp-2">
                  {reservation.subScenario.scenario?.address}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {reservation.subScenario.scenario?.neighborhood?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          {isActive ? (
            <div className="space-y-2">
              {onModify && (
                <Button
                  variant="default"
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 group/btn font-medium relative ${
                    highlightManageButton
                      ? "ring-2 ring-blue-300 ring-offset-2 shadow-blue-200/50 shadow-lg"
                      : ""
                  }`}
                  onClick={() => onModify(reservation)}
                >
                  {highlightManageButton && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                  )}
                  <Settings className="mr-2 h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                  Gestionar reserva
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 group/btn"
                onClick={() => setIsConfirmOpen(true)}
              >
                <X className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                Cancelar reserva
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {onModify && (
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-200 group/btn"
                  onClick={() => onModify(reservation)}
                >
                  <Settings className="mr-2 h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                  Gestionar reserva
                </Button>
              )}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-500 font-medium">
                  Reserva completada
                </span>
                <CheckCircle2 className="w-4 h-4 ml-1 text-gray-400" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              Cancelar Reserva
            </DialogTitle>
            <DialogDescription className="text-gray-600 leading-relaxed">
              ¿Estás seguro que deseas cancelar esta reserva? Una vez cancelada,
              el horario estará disponible para otros usuarios.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 px-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {dateInfo.isRange ? (
                <Repeat className="w-4 h-4 text-purple-600" />
              ) : (
                <CalendarDays className="w-4 h-4 text-blue-600" />
              )}
              <span className={`text-xs font-medium ${
                dateInfo.isRange ? "text-purple-600" : "text-blue-600"
              }`}>
                {dateInfo.isRange ? "RESERVA DE RANGO" : "RESERVA ÚNICA"}
              </span>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
              {reservation.subScenario.name}
            </h4>
            
            <p className="text-sm text-gray-600 mb-2 capitalize">
              {dateInfo.fullDate}
            </p>
            
            {dateInfo.isRange && dateInfo.weekDays.length > 0 && (
              <p className="text-xs text-purple-600 mb-2">
                Días: {getWeekDayNames(dateInfo.weekDays)}
              </p>
            )}
            
            {timeSlot && (
              <p className="text-sm text-gray-600">
                {timeSlot.startTime} - {timeSlot.endTime}
                {reservation.timeslots && reservation.timeslots.length > 1 && (
                  <span className="text-xs text-green-600 ml-2">
                    (+{reservation.timeslots.length - 1} más)
                  </span>
                )}
              </p>
            )}
          </div>

          <DialogFooter className="sm:justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isCancelling}
              className="flex-1"
            >
              Mantener reserva
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelReservation}
              disabled={isCancelling}
              className="flex items-center flex-1"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Confirmar cancelación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
