"use client";

import {
  AlertTriangle,
  CalendarX,
  CheckCircle,
  Clock,
  Info,
  MapPin,
  Settings,
  User,
  X,
  Zap,
  CalendarDays,
  Repeat,
  CalendarRange,
  Building,
  Mail,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cancelReservationAction } from "../../use-cases/cancel/actions/cancel-reservation.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ClickableStatusBadge } from "../molecules/clickable-status-badge";
import { ReservationDto } from "@/services/reservation.service";
import { formatReservationInfo } from "../../utils/utils";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { tabTrigger } from "../../utils/ui";
import { AnimatePresence, motion } from "framer-motion";

interface ModifyReservationModalProps {
  reservation: ReservationDto | null;
  isOpen: boolean;
  onClose: () => void;
  onReservationUpdated: (reservationId: number) => void;
  onCreateNewReservation: (subScenarioId: number) => void;
}

export function ModifyReservationModal({
  reservation,
  isOpen,
  onClose,
  onReservationUpdated,
  onCreateNewReservation,
}: ModifyReservationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [tab, setTab] = useState<"details" | "client" | "actions">("details");

  if (!reservation) return null;

  const reservationInfo = formatReservationInfo(reservation);
  const isRange = reservationInfo.type === "RANGE";

  const isReservationActive = () => {
    const now = new Date();
    const firstSlot = reservation.timeslots?.[0] ?? reservation.timeSlot;
    const endDateTime = firstSlot
      ? new Date(`${reservation.initialDate}T${firstSlot.endTime}`)
      : new Date(`${reservation.initialDate}T23:59`);
    return (
      endDateTime >= now && reservation.reservationState.state !== "CANCELADA"
    );
  };

  const canModify =
    isReservationActive() &&
    ["PENDIENTE", "CONFIRMADA"].includes(reservation.reservationState.state);

  const handleCancelReservation = async () => {
    setIsLoading(true);
    try {
      await cancelReservationAction(reservation.id);
      toast.success("Tu reserva ha sido cancelada exitosamente");
      onReservationUpdated(reservation.id);
      onClose();
    } catch (err) {
      toast.error("No se pudo cancelar la reserva. Intenta de nuevo");
    } finally {
      setIsLoading(false);
      setShowCancelConfirm(false);
    }
  };

  const handleStatusChange = (_newStatusId: number) => {
    onReservationUpdated(reservation.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Gestionar Reserva</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  ID: #{reservation.id} • {reservation.subScenario.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs font-medium ${
                  isRange
                    ? "bg-purple-100 text-purple-700 border-purple-200"
                    : "bg-blue-100 text-blue-700 border-blue-200"
                }`}
              >
                {isRange ? (
                  <>
                    <CalendarRange className="w-3 h-3 mr-1" />
                    RANGO
                  </>
                ) : (
                  <>
                    <CalendarDays className="w-3 h-3 mr-1" />
                    ÚNICA
                  </>
                )}
              </Badge>
              <ClickableStatusBadge
                statusId={reservation.reservationState.id}
              />
            </div>
          </DialogTitle>
        </DialogHeader>

<div className="flex-1 overflow-y-auto">
  <Tabs
    value={tab}
    onValueChange={(value) =>
      setTab(value as "details" | "client" | "actions")
    }
    className="w-full"
  >
    {/* ───────────── TAB LIST ───────────── */}
    <TabsList className="flex justify-center gap-x-6 mb-6">
      <TabsTrigger value="details" className={tabTrigger({ active: true })}>
        <Info className="h-4 w-4" />
        Detalles de la reserva
      </TabsTrigger>
      <TabsTrigger value="client" className={tabTrigger({ active: true })}>
        <User className="h-4 w-4" />
        Detalles del cliente
      </TabsTrigger>
      <TabsTrigger value="actions" className={tabTrigger({ active: true })}>
        <Zap className="h-4 w-4" />
        Acciones
      </TabsTrigger>
    </TabsList>

    {/* ───────────── CONTENIDOS ANIMADOS ───────────── */}
    <div className="relative">
      <AnimatePresence mode="wait">
        {/* ---------- DETAILS ---------- */}
        {tab === "details" && (
          <motion.div
            key="details"
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-6"
          >
            {/* Resumen de la reserva */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Resumen de la Reserva</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      reservation.subScenario.hasCost
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }
                  >
                    {reservation.subScenario.hasCost ? "De pago" : "Gratuito"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Información de fechas */}
                <div
                  className={`p-4 rounded-lg border-2 ${
                    isRange
                      ? "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200"
                      : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {isRange ? (
                      <CalendarRange className="h-6 w-6 text-purple-600" />
                    ) : (
                      <CalendarDays className="h-6 w-6 text-blue-600" />
                    )}
                    <div>
                      <h3
                        className={`font-semibold ${
                          isRange ? "text-purple-800" : "text-blue-800"
                        }`}
                      >
                        {isRange ? "Reserva de Rango" : "Reserva Única"}
                      </h3>
                      <p
                        className={`text-sm ${
                          isRange ? "text-purple-600" : "text-blue-600"
                        }`}
                      >
                        {isRange
                          ? `${reservationInfo.durationDays} días • ${reservationInfo.totalInstances} instancias`
                          : `1 día • ${reservationInfo.totalInstances} instancia${
                              reservationInfo.totalInstances > 1 ? "s" : ""
                            }`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span
                        className={`text-xs font-medium uppercase tracking-wide ${
                          isRange ? "text-purple-700" : "text-blue-700"
                        }`}
                      >
                        {isRange ? "Fecha de inicio" : "Fecha"}
                      </span>
                      <p
                        className={`text-sm font-medium capitalize ${
                          isRange ? "text-purple-800" : "text-blue-800"
                        }`}
                      >
                        {reservationInfo.startDate}
                      </p>
                    </div>

                    {isRange && (
                      <div>
                        <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                          Fecha de fin
                        </span>
                        <p className="text-sm font-medium text-purple-800 capitalize">
                          {reservationInfo.endDate}
                        </p>
                      </div>
                    )}
                  </div>

                  {isRange &&
                    (reservationInfo.weekDayNames?.length ?? 0) > 0 && (
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                          Días de la semana
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {reservationInfo.weekDayNames?.map((day, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-purple-200 text-purple-800"
                            >
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Horarios */}
                {reservation.timeslots?.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">
                        Horarios {isRange ? "por día" : ""}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {reservation.timeslots.map((slot) => (
                        <div
                          key={slot.id}
                          className="bg-white p-3 rounded-lg border border-green-200 shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-600">
                        <strong>Total:</strong> {reservation.timeslots.length}{" "}
                        horario
                        {reservation.timeslots.length > 1 ? "s" : ""}
                        {isRange && ` × ${reservationInfo.durationDays} días`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información del escenario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-teal-600" />
                  Información del Escenario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Escenario Principal
                    </h4>
                    <p className="text-gray-900 font-medium">
                      {reservation.subScenario.scenario?.name}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Sub-escenario
                    </h4>
                    <p className="text-gray-900 font-medium">
                      {reservation.subScenario.name}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    Dirección
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-900 font-medium">
                      {reservation.subScenario.scenario?.address}
                    </p>
                    {reservation.subScenario.scenario?.neighborhood?.name && (
                      <p className="text-gray-600 text-sm mt-1">
                        {reservation.subScenario.scenario.neighborhood.name}
                        {reservation.subScenario.scenario.neighborhood.commune && (
                          <>
                            {" "}
                            •{" "}
                            {
                              reservation.subScenario.scenario.neighborhood
                                .commune.name
                            }
                          </>
                        )}
                        {reservation.subScenario.scenario.neighborhood.commune
                          ?.city && (
                          <>
                            {" "}
                            •{" "}
                            {
                              reservation.subScenario.scenario.neighborhood
                                .commune.city.name
                            }
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Comentarios */}
                {reservation.comments && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Info className="h-4 w-4 text-blue-600" />
                      Comentarios
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 whitespace-pre-wrap">
                        {reservation.comments}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ---------- CLIENT ---------- */}
        {tab === "client" && (
          <motion.div
            key="client"
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-teal-600" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Nombre completo
                      </h4>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900 font-medium">
                          {reservation.user
                            ? `${reservation.user.firstName} ${reservation.user.lastName}`
                            : "Cliente sin nombre"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Correo electrónico
                      </h4>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900 font-medium">
                          {reservation.user?.email || "Sin email"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Teléfono
                      </h4>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900 font-medium">
                          {reservation.user?.phone || "Sin teléfono"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Resumen del Cliente
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        • Reserva activa desde{" "}
                        {new Date(
                          reservation.initialDate
                        ).toLocaleDateString("es-ES")}
                      </p>
                      <p>• Estado: {reservation.reservationState.state}</p>
                      <p>
                        • Tipo:{" "}
                        {reservation.subScenario.hasCost
                          ? "Cliente de pago"
                          : "Cliente gratuito"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ---------- ACTIONS ---------- */}
        {tab === "actions" && (
          <motion.div
            key="actions"
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-6"
          >
            {canModify ? (
              <div className="space-y-6">
                {/* Cancelar reserva */}
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <CalendarX className="h-5 w-5" />
                      Cancelar Reserva
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!showCancelConfirm ? (
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          Cancela tu reserva completamente. Esta acción no se
                          puede deshacer.
                        </p>
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50 w-full"
                          onClick={() => setShowCancelConfirm(true)}
                        >
                          <CalendarX className="h-4 w-4 mr-2" />
                          Cancelar Reserva
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <div>
                            <h5 className="font-medium text-red-700">
                              Confirmar Cancelación
                            </h5>
                            <p className="text-sm text-red-600">
                              ¿Estás seguro de que quieres cancelar esta reserva?
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="destructive"
                            onClick={handleCancelReservation}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            {isLoading ? "Cancelando..." : "Sí, Cancelar"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowCancelConfirm(false)}
                            className="flex-1"
                          >
                            No, Mantener
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Separator />

                {/* Información sobre modificaciones */}
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <Info className="h-5 w-5" />
                      Cambio de Fecha u Horario
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800 text-sm leading-relaxed">
                        <strong>No es posible modificar</strong> la fecha u
                        horario de una reserva existente. Para cambiar estos
                        datos, debes <strong>cancelar esta reserva</strong> y
                        crear una nueva.
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        Crear nueva reserva para este escenario
                      </span>
                      <Link
                        href={`/scenario/${reservation.subScenarioId}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
                      >
                        Ir al escenario →
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Aviso importante */}
                <Card className="border-amber-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h6 className="font-medium text-amber-800 mb-1">
                          Importante
                        </h6>
                        <p className="text-sm text-amber-700 leading-relaxed">
                          Tampoco es posible cambiar de escenario en una reserva
                          existente. Para reservar otro escenario, crea una nueva
                          reserva desde el inicio.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-700 mb-2 text-lg">
                      Reserva No Modificable
                    </h4>
                    <p className="text-gray-600">
                      {reservation.reservationState.state === "CANCELADA"
                        ? "Esta reserva ya ha sido cancelada."
                        : "Esta reserva ya ha pasado y no se puede modificar."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </Tabs>
</div>


        {/* Footer */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4">
          <div className="text-sm text-gray-500">
            Reserva #{reservation.id} • Última actualización:{" "}
            {new Date().toLocaleDateString("es-ES")}
          </div>
          <Button variant="outline" onClick={onClose} className="px-6">
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
