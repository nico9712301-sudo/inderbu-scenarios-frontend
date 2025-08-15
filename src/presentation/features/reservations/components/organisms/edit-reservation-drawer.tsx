"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";
import { updateReservationStateAction, UpdateReservationResult } from "../../use-cases/update/actions/update-reservation.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { ReservationDto } from "@/entities/reservation/model/types";
import { formatDate } from "@/utils/reservation.utils";
import { toast } from "@/shared/hooks/use-toast";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";



interface EditReservationDrawerProps {
  reservation: ReservationDto | null;
  onClose: () => void;
}

export const EditReservationDrawer = ({
  reservation,
  onClose,
}: EditReservationDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState({
    id: 0,
    date: "",
    reservationStateId: 1,
    observations: "",
  });

  // Sync open state with prop
  useEffect(() => {
    setOpen(!!reservation);
    if (reservation) {
      setEditing({
        id: reservation.id,
        date: reservation.reservationDate,
        reservationStateId: reservation.reservationStateId ?? 1,
        observations: "",
      });
    }
  }, [reservation]);

  const handleSave = async () => {
    if (!reservation) return;
    try {
      // Use DDD server action instead of legacy service
      const result: UpdateReservationResult = await updateReservationStateAction(
        reservation.id,
        { reservationStateId: editing.reservationStateId }
      );
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message || "Reserva actualizada correctamente.",
        });
        onClose(); // container volverá a refrescar la lista
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo actualizar la reserva.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Update reservation exception:', err);
      toast({
        title: "Error",
        description: err.message ?? "Ocurrió un error al actualizar la reserva.",
        variant: "destructive",
      });
    }
  };

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="w-full sm:w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Editar Reserva</DrawerTitle>
        </DrawerHeader>

        {reservation && (
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Input
                readOnly
                value={
                  reservation.user
                    ? `${reservation.user.first_name} ${reservation.user.last_name} - ${reservation.user.email}`
                    : "Cliente sin nombre"
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Escenario</Label>
              <Input
                readOnly
                value={`${reservation.subScenario?.name ?? "Esc."} (${reservation.subScenario?.scenarioName ?? "N/A"})`}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Reserva</Label>
              <Input readOnly type="date" value={editing.date} />
            </div>

            <div className="space-y-2">
              <Label>Hora</Label>
              <Input
                readOnly
                value={
                  reservation.timeSlot
                    ? `${reservation.timeSlot.startTime} - ${reservation.timeSlot.endTime}`
                    : "Horario no disponible"
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                value={editing.observations}
                onChange={(e) =>
                  setEditing({ ...editing, observations: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Creado</Label>
              <Input
                readOnly
                disabled
                value={
                  reservation.createdAt
                    ? new Date(reservation.createdAt).toLocaleString()
                    : "Fecha no disponible"
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={editing.reservationStateId.toString()}
                onValueChange={(v) =>
                  setEditing({ ...editing, reservationStateId: parseInt(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Pendiente</SelectItem>
                  <SelectItem value="2">Confirmada</SelectItem>
                  <SelectItem value="3">Rechazada</SelectItem>
                  <SelectItem value="4">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DrawerFooter>
          <Button className="w-full" onClick={handleSave}>
            Guardar
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
