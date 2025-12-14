"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { sendReceiptByEmailAction, getReceiptsByReservationAction } from "@/infrastructure/web/controllers/dashboard/billing.actions";
import type { ReservationDto } from "@/entities/reservation/model/types";
import type { ReceiptPlainObject } from "@/entities/billing/domain/ReceiptEntity";

interface SendReceiptModalProps {
  open: boolean;
  onClose: () => void;
  reservation: ReservationDto | null;
  onSuccess?: () => void;
}

export function SendReceiptModal({
  open,
  onClose,
  reservation,
  onSuccess,
}: SendReceiptModalProps) {
  const [latestReceipt, setLatestReceipt] = useState<ReceiptPlainObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  // Load latest receipt when modal opens
  useEffect(() => {
    if (open && reservation) {
      loadLatestReceipt();
    }
  }, [open, reservation]);

  const loadLatestReceipt = async () => {
    if (!reservation) return;

    setLoadingReceipt(true);
    try {
      const result = await getReceiptsByReservationAction(reservation.id);
      if (result.success && result.data.length > 0) {
        // Get the most recent receipt (last generated)
        const receipts = result.data;
        const latest = receipts.sort(
          (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
        )[0];
        setLatestReceipt(latest);
      } else {
        toast.error("No hay recibos generados", {
          description: "Debe generar un recibo primero antes de enviarlo por email.",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error loading receipt:", error);
      toast.error("Error al cargar recibo");
      onClose();
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handleSend = async () => {
    if (!reservation || !latestReceipt || !reservation.user?.email) {
      toast.error("No se puede enviar el recibo");
      return;
    }

    setLoading(true);
    try {
      const result = await sendReceiptByEmailAction({
        receiptId: latestReceipt.id,
        email: reservation.user.email,
      });

      if (result.success) {
        toast.success("Recibo enviado exitosamente", {
          description: `El recibo ha sido enviado a ${reservation.user.email}`,
        });
        onSuccess?.();
        onClose();
      } else {
        toast.error("Error al enviar recibo", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error sending receipt:", error);
      toast.error("Error al enviar recibo");
    } finally {
      setLoading(false);
    }
  };

  if (!reservation || !reservation.user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Recibo por Email</DialogTitle>
          <DialogDescription>
            Se enviará el recibo más reciente por correo electrónico al cliente.
          </DialogDescription>
        </DialogHeader>

        {loadingReceipt ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              Cargando recibo...
            </span>
          </div>
        ) : latestReceipt ? (
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Destinatario</p>
              <div className="space-y-1">
                <p className="text-sm">
                  {reservation.user.firstName} {reservation.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {reservation.user.email}
                </p>
              </div>
            </div>

            <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
              <p className="text-sm text-blue-800">
                Se enviará el recibo generado el{" "}
                {new Date(latestReceipt.generatedAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                .
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || loadingReceipt || !latestReceipt}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar Recibo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
