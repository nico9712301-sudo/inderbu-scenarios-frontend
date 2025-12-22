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
import { sendReceiptByEmailAction } from "@/infrastructure/web/controllers/dashboard/billing.actions";
import type { ReservationDto } from "@/entities/reservation/model/types";
import type { ReceiptPlainObject } from "@/entities/billing/domain/ReceiptEntity";
import { ReceiptSearchCombobox } from "../molecules/receipt-search-combobox";
import { ReceiptRenderer } from "./receipt-renderer";
import type { TemplateContent } from "./template-builder/types/template-builder.types";

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
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptPlainObject | null>(null);
  const [templateContent, setTemplateContent] = useState<TemplateContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedReceipt(null);
      setTemplateContent(null);
    }
  }, [open]);

  // Load template content when receipt is selected
  useEffect(() => {
    if (selectedReceipt?.templateContent) {
      loadTemplateContent(selectedReceipt.templateContent);
    } else {
      setTemplateContent(null);
    }
  }, [selectedReceipt]);

  const loadTemplateContent = async (contentString: string) => {
    setLoadingTemplate(true);
    try {
      const parsed = JSON.parse(contentString);
      setTemplateContent(parsed);
    } catch (error) {
      console.error("Error parsing template content:", error);
      toast.error("Error al cargar el contenido de la plantilla");
      setTemplateContent(null);
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleReceiptChange = (receiptId: number | null, receipt?: ReceiptPlainObject) => {
    if (receipt) {
      setSelectedReceipt(receipt);
    } else {
      setSelectedReceipt(null);
      setTemplateContent(null);
    }
  };

  const handleSend = async () => {
    if (!reservation || !selectedReceipt || !reservation.user?.email) {
      toast.error("No se puede enviar el recibo");
      return;
    }

    setLoading(true);
    try {
      const result = await sendReceiptByEmailAction({
        receiptId: selectedReceipt.id,
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Recibo por Email</DialogTitle>
          <DialogDescription>
            Selecciona el recibo que deseas enviar por correo electrónico al cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Destinatario */}
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

          {/* Selector de Recibo */}
          <div className="space-y-2">
            <Label htmlFor="receipt-select">Seleccionar Recibo</Label>
            <ReceiptSearchCombobox
              reservationId={reservation.id}
              value={selectedReceipt?.id || null}
              onValueChange={handleReceiptChange}
              placeholder="Buscar recibo por fecha..."
              disabled={loading}
            />
          </div>

          {/* Preview del Recibo */}
          {loadingTemplate ? (
            <div className="flex items-center justify-center py-12 border rounded-md">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Cargando preview del recibo...
              </span>
            </div>
          ) : selectedReceipt && templateContent ? (
            <div className="space-y-2">
              <Label>Preview del Recibo</Label>
              <div className="border rounded-md p-4 bg-white overflow-auto max-h-[500px]">
                <ReceiptRenderer
                  receipt={selectedReceipt}
                  reservation={reservation}
                  content={templateContent}
                />
              </div>
            </div>
          ) : selectedReceipt && !templateContent ? (
            <div className="border rounded-md p-8 text-center text-muted-foreground">
              <p>No se pudo cargar el contenido de la plantilla.</p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || loadingTemplate || !selectedReceipt || !templateContent}
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
